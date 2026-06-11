import { authService } from './authService.js';

export interface ScanResponse {
  barcode: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function getHeaders() {
  const token = authService.getCurrentToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const scannerService = {
  // 1. Register session
  async registerSession(sessionId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/scanner/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to register scanning session');
    }
  },

  // 2. Poll for barcode
  async pollSession(sessionId: string): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE_URL}/scanner/poll?sessionId=${sessionId}`, {
      headers: getHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to poll scanning session');
    }

    return res.json();
  },

  // 3. Post barcode scan
  async scanBarcode(sessionId: string, barcode: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/scanner/scan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId, barcode })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to transmit scanned barcode');
    }
  }
};

export default scannerService;
