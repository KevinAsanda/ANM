import test from 'node:test';
import assert from 'node:assert';

// Setup environment for testing mock mode BEFORE importing controllers
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const { registerSession, pollSession, scanBarcode } = await import('../controllers/scanner.controller.js');

test('Sprint 13 - Barcode Scanner Integration Service: register, poll, and scan events', async () => {
  const sessionId = 'mock-scanner-session-xyz';
  const barcodeValue = '6001234567890'; // Mock barcode string

  // Mock Request and Response for Register Session
  let registerBody: any = { sessionId };
  const mockResRegister: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.data = data;
      return this;
    }
  };

  registerSession({ body: registerBody } as any, mockResRegister, () => {});
  assert.strictEqual(mockResRegister.statusCode, 200);
  assert.strictEqual(mockResRegister.data.sessionId, sessionId);

  // Mock Request and Response for Polling (before scan)
  const mockResPollEmpty: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.data = data;
      return this;
    }
  };

  pollSession({ query: { sessionId } } as any, mockResPollEmpty, () => {});
  assert.strictEqual(mockResPollEmpty.statusCode, 200);
  assert.strictEqual(mockResPollEmpty.data.barcode, null);

  // Mock Request and Response for Scan Barcode
  let scanBody: any = { sessionId, barcode: barcodeValue };
  const mockResScan: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.data = data;
      return this;
    }
  };

  scanBarcode({ body: scanBody } as any, mockResScan, () => {});
  assert.strictEqual(mockResScan.statusCode, 200);
  assert.strictEqual(mockResScan.data.barcode, barcodeValue);

  // Mock Request and Response for Polling (after scan)
  const mockResPollSuccess: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.data = data;
      return this;
    }
  };

  pollSession({ query: { sessionId } } as any, mockResPollSuccess, () => {});
  assert.strictEqual(mockResPollSuccess.statusCode, 200);
  assert.strictEqual(mockResPollSuccess.data.barcode, barcodeValue);

  // Subsequent polling should return null (cleared state)
  const mockResPollCleared: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.data = data;
      return this;
    }
  };

  pollSession({ query: { sessionId } } as any, mockResPollCleared, () => {});
  assert.strictEqual(mockResPollCleared.statusCode, 200);
  assert.strictEqual(mockResPollCleared.data.barcode, null);
});
