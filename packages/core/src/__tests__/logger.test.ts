import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConsoleLogger, NoopLogger } from '../index.js';

describe('ConsoleLogger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log debug messages with default prefix', () => {
    const logger = new ConsoleLogger();
    logger.debug('test message', { extra: 'data' });

    expect(console.debug).toHaveBeenCalledWith('[ArubaSDK] test message', { extra: 'data' });
  });

  it('should log info messages with default prefix', () => {
    const logger = new ConsoleLogger();
    logger.info('test message');

    expect(console.info).toHaveBeenCalledWith('[ArubaSDK] test message');
  });

  it('should log warn messages with default prefix', () => {
    const logger = new ConsoleLogger();
    logger.warn('test message');

    expect(console.warn).toHaveBeenCalledWith('[ArubaSDK] test message');
  });

  it('should log error messages with default prefix', () => {
    const logger = new ConsoleLogger();
    const error = new Error('test error');
    logger.error('something failed', error);

    expect(console.error).toHaveBeenCalledWith('[ArubaSDK] something failed', error);
  });

  it('should use custom prefix when provided', () => {
    const logger = new ConsoleLogger('[CustomPrefix]');
    logger.info('test message');

    expect(console.info).toHaveBeenCalledWith('[CustomPrefix] test message');
  });
});

describe('NoopLogger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not log anything for debug', () => {
    const logger = new NoopLogger();
    logger.debug('test message');

    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should not log anything for info', () => {
    const logger = new NoopLogger();
    logger.info('test message');

    expect(console.info).not.toHaveBeenCalled();
  });

  it('should not log anything for warn', () => {
    const logger = new NoopLogger();
    logger.warn('test message');

    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should not log anything for error', () => {
    const logger = new NoopLogger();
    logger.error('test message');

    expect(console.error).not.toHaveBeenCalled();
  });

  it('should return singleton instance', () => {
    const instance1 = NoopLogger.instance;
    const instance2 = NoopLogger.instance;

    expect(instance1).toBe(instance2);
  });

  it('should allow creating new instances', () => {
    const instance1 = new NoopLogger();
    const instance2 = new NoopLogger();

    expect(instance1).not.toBe(instance2);
  });
});
