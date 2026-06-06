import test from 'node:test';
import assert from 'node:assert';
import { authenticate } from './auth.js';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';

// Setup environment for testing mock tokens
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

test('authenticate middleware - valid admin token', async () => {
  const req = {
    headers: {
      authorization: 'Bearer mock-jwt-token-admin-12345'
    }
  } as unknown as AuthenticatedRequest;

  let jsonResponse: any = null;
  let responseStatus: number = 200;

  const res = {
    status(code: number) {
      responseStatus = code;
      return this;
    },
    json(body: any) {
      jsonResponse = body;
      return this;
    }
  } as unknown as Response;

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  await authenticate(req, res, next);

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(jsonResponse, null);
  assert.strictEqual(req.user?.role, 'admin');
  assert.strictEqual(req.user?.name, 'Mpume Zulu');
});

test('authenticate middleware - valid mechanic token', async () => {
  const req = {
    headers: {
      authorization: 'Bearer mock-jwt-token-mechanic-12345'
    }
  } as unknown as AuthenticatedRequest;

  let jsonResponse: any = null;
  let responseStatus: number = 200;

  const res = {
    status(code: number) {
      responseStatus = code;
      return this;
    },
    json(body: any) {
      jsonResponse = body;
      return this;
    }
  } as unknown as Response;

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  await authenticate(req, res, next);

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(jsonResponse, null);
  assert.strictEqual(req.user?.role, 'mechanic');
  assert.strictEqual(req.user?.name, 'Asanda Cele');
});

test('authenticate middleware - missing authorization header', async () => {
  const req = {
    headers: {}
  } as unknown as AuthenticatedRequest;

  let jsonResponse: any = null;
  let responseStatus: number = 200;

  const res = {
    status(code: number) {
      responseStatus = code;
      return this;
    },
    json(body: any) {
      jsonResponse = body;
      return this;
    }
  } as unknown as Response;

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  await authenticate(req, res, next);

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(responseStatus, 401);
  assert.strictEqual(jsonResponse?.error, 'UNAUTHORIZED');
  assert.strictEqual(jsonResponse?.message?.includes('missing'), true);
});

test('authenticate middleware - invalid/malformed token', async () => {
  const req = {
    headers: {
      authorization: 'Bearer invalid-token-value'
    }
  } as unknown as AuthenticatedRequest;

  let jsonResponse: any = null;
  let responseStatus: number = 200;

  const res = {
    status(code: number) {
      responseStatus = code;
      return this;
    },
    json(body: any) {
      jsonResponse = body;
      return this;
    }
  } as unknown as Response;

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  await authenticate(req, res, next);

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(responseStatus, 401);
  assert.strictEqual(jsonResponse?.error, 'UNAUTHORIZED');
  assert.strictEqual(jsonResponse?.message?.includes('invalid'), true);
});
