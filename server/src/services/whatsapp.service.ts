import dotenv from 'dotenv';
dotenv.config();

export class WhatsAppService {
  private static accountSid = process.env.TWILIO_ACCOUNT_SID;
  private static authToken = process.env.TWILIO_AUTH_TOKEN;
  private static fromNumber = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'
  private static adminNumber = process.env.ADMIN_WHATSAPP_NUMBER; // e.g., 'whatsapp:+27821234567'

  static async sendInvoiceNotification(
    customerName: string,
    customerPhone: string,
    registrationNumber: string,
    makeModel: string,
    invoiceNo: string,
    totalAmount: number,
    secureToken: string
  ): Promise<{ success: boolean; method: 'twilio' | 'simulated'; error?: string }> {
    const clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
    const publicUrl = `${clientBaseUrl}/public/invoices/${secureToken}`;

    const customerMessage = `Hi ${customerName}, your vehicle ${makeModel} (${registrationNumber}) is ready for collection at ANM Workshop! 🚗\n\n` +
      `Invoice No: ${invoiceNo}\n` +
      `Total Amount: ZAR ${totalAmount.toFixed(2)}\n\n` +
      `View your detailed invoice and payment options here: ${publicUrl}\n\n` +
      `Thank you for choosing ANM Workshop!`;

    const adminMessage = `ANM Admin Notification 🔔\n\n` +
      `Job Completed: ${makeModel} (${registrationNumber})\n` +
      `Invoice No: ${invoiceNo}\n` +
      `Total: ZAR ${totalAmount.toFixed(2)}\n` +
      `Customer: ${customerName} (${customerPhone})\n` +
      `Invoice Link: ${publicUrl}`;

    console.log('\n--- [MOCK WHATSAPP NOTIFICATION] ---');
    console.log(`To Customer (${customerPhone}):\n${customerMessage}`);
    console.log(`To Admin (${this.adminNumber || 'Not Configured'}):\n${adminMessage}`);
    console.log('------------------------------------\n');

    if (this.accountSid && this.authToken && this.fromNumber) {
      try {
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        
        // Form-encode numbers for Twilio
        const customerTo = `whatsapp:${customerPhone.startsWith('+') ? customerPhone : '+27' + customerPhone.replace(/^0/, '')}`;

        // Send to Customer
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: this.fromNumber,
            To: customerTo,
            Body: customerMessage
          })
        });

        // Send to Admin
        if (this.adminNumber) {
          const adminTo = this.adminNumber.startsWith('whatsapp:') ? this.adminNumber : `whatsapp:${this.adminNumber}`;
          await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              From: this.fromNumber,
              To: adminTo,
              Body: adminMessage
            })
          });
        }

        return { success: true, method: 'twilio' };
      } catch (err: any) {
        console.error('Failed to send real WhatsApp message via Twilio:', err.message);
        return { success: false, method: 'simulated', error: err.message };
      }
    }

    return { success: true, method: 'simulated' };
  }
}
