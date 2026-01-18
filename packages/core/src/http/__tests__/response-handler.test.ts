import { describe, it, expect } from 'vitest';
import { ResponseHandler } from '../response-handler.js';
import { ArubaApiError, RateLimitError } from '../../types/index.js';

describe('ResponseHandler', () => {
  const handler = new ResponseHandler();

  describe('successful responses', () => {
    it('should parse JSON response', async () => {
      const data = { foo: 'bar' };
      const response = new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await handler.handle<typeof data>(response);

      expect(result).toEqual(data);
    });

    it('should parse text response when not JSON', async () => {
      const response = new Response('plain text', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });

      const result = await handler.handle<string>(response);

      expect(result).toBe('plain text');
    });

    it('should handle JSON with charset in content-type', async () => {
      const data = { test: 'value' };
      const response = new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });

      const result = await handler.handle<typeof data>(response);

      expect(result).toEqual(data);
    });
  });

  describe('error responses', () => {
    it('should throw RateLimitError on 429', async () => {
      const response = new Response(null, {
        status: 429,
        headers: { 'Retry-After': '60' },
      });

      await expect(handler.handle(response)).rejects.toThrow(RateLimitError);
    });

    it('should include retryAfter from header', async () => {
      const response = new Response(null, {
        status: 429,
        headers: { 'Retry-After': '120' },
      });

      try {
        await handler.handle(response);
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(120);
      }
    });

    it('should throw ArubaApiError from JSON error body', async () => {
      const errorBody = {
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error message',
        },
      };
      const response = new Response(JSON.stringify(errorBody), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });

      await expect(handler.handle(response)).rejects.toThrow(ArubaApiError);
    });

    it('should throw generic ArubaApiError for non-JSON error', async () => {
      const response = new Response('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      try {
        await handler.handle(response);
      } catch (error) {
        expect(error).toBeInstanceOf(ArubaApiError);
        expect((error as ArubaApiError).code).toBe('HTTP_ERROR');
        expect((error as ArubaApiError).statusCode).toBe(500);
      }
    });

    it('should handle empty error response', async () => {
      const response = new Response(null, {
        status: 404,
        statusText: 'Not Found',
      });

      try {
        await handler.handle(response);
      } catch (error) {
        expect(error).toBeInstanceOf(ArubaApiError);
        expect((error as ArubaApiError).message).toBe('Not Found');
      }
    });
  });
});
