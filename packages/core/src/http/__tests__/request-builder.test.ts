import { describe, it, expect } from 'vitest';
import { RequestBuilder } from '../request-builder.js';
import type { EnvironmentConfig } from '../../types/index.js';

describe('RequestBuilder', () => {
  const config: EnvironmentConfig = {
    authUrl: 'https://auth.example.com',
    wsUrl: 'https://ws.example.com',
  };

  describe('build', () => {
    it('should build GET request with auth URL', () => {
      const builder = new RequestBuilder(config);

      const { url, init } = builder.build({
        method: 'GET',
        baseType: 'auth',
        path: '/test',
      });

      expect(url).toBe('https://auth.example.com/test');
      expect(init.method).toBe('GET');
    });

    it('should build GET request with ws URL', () => {
      const builder = new RequestBuilder(config);

      const { url, init } = builder.build({
        method: 'GET',
        baseType: 'ws',
        path: '/api/v2/test',
      });

      expect(url).toBe('https://ws.example.com/api/v2/test');
      expect(init.method).toBe('GET');
    });

    it('should append query params', () => {
      const builder = new RequestBuilder(config);

      const { url } = builder.build({
        method: 'GET',
        baseType: 'ws',
        path: '/search',
        params: { q: 'test', page: 1, active: true },
      });

      expect(url).toBe('https://ws.example.com/search?q=test&page=1&active=true');
    });

    it('should skip undefined params', () => {
      const builder = new RequestBuilder(config);

      const { url } = builder.build({
        method: 'GET',
        baseType: 'ws',
        path: '/search',
        params: { q: 'test', page: undefined },
      });

      expect(url).toBe('https://ws.example.com/search?q=test');
    });

    it('should build POST request with JSON body', () => {
      const builder = new RequestBuilder(config);
      const body = { name: 'test', value: 123 };

      const { init } = builder.build({
        method: 'POST',
        baseType: 'ws',
        path: '/create',
        body,
      });

      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(body));
    });

    it('should not include body for GET requests', () => {
      const builder = new RequestBuilder(config);

      const { init } = builder.build({
        method: 'GET',
        baseType: 'ws',
        path: '/test',
        body: { ignored: true },
      });

      expect(init.body).toBeUndefined();
    });

    it('should include default headers', () => {
      const builder = new RequestBuilder(config);

      const { init } = builder.build({
        method: 'GET',
        baseType: 'ws',
        path: '/test',
      });

      expect(init.headers).toEqual({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });
    });

    it('should merge custom headers', () => {
      const builder = new RequestBuilder(config, { 'X-Custom': 'value' });

      const { init } = builder.build({
        method: 'GET',
        baseType: 'ws',
        path: '/test',
        headers: { 'X-Request': 'header' },
      });

      expect(init.headers).toEqual({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Custom': 'value',
        'X-Request': 'header',
      });
    });
  });

  describe('access token', () => {
    it('should add Authorization header when token is set', () => {
      const builder = new RequestBuilder(config);
      builder.setAccessToken('test-token');

      const { init } = builder.build({
        method: 'GET',
        baseType: 'ws',
        path: '/test',
      });

      expect(init.headers).toHaveProperty('Authorization', 'Bearer test-token');
    });

    it('should not add Authorization header when token is null', () => {
      const builder = new RequestBuilder(config);
      builder.setAccessToken(null);

      const { init } = builder.build({
        method: 'GET',
        baseType: 'ws',
        path: '/test',
      });

      expect(init.headers).not.toHaveProperty('Authorization');
    });

    it('should return access token via getter', () => {
      const builder = new RequestBuilder(config);

      expect(builder.getAccessToken()).toBeNull();

      builder.setAccessToken('my-token');
      expect(builder.getAccessToken()).toBe('my-token');
    });
  });

  describe('buildFormRequest', () => {
    it('should build form-urlencoded request', () => {
      const builder = new RequestBuilder(config);

      const { url, init } = builder.buildFormRequest('auth', '/signin', {
        username: 'user',
        password: 'pass',
      });

      expect(url).toBe('https://auth.example.com/signin');
      expect(init.method).toBe('POST');
      expect(init.headers).toHaveProperty(
        'Content-Type',
        'application/x-www-form-urlencoded'
      );
      expect(init.body).toBe('username=user&password=pass');
    });
  });
});
