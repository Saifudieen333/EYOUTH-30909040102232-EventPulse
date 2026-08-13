// tests/utils.test.js
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

describe('AppError', () => {
  test('stores message, statusCode and isOperational', () => {
    const err = new AppError('Not found', 404);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});

describe('asyncHandler', () => {
  test('SUCCESS: runs the controller and does not call next', async () => {
    const handler = asyncHandler(async (req, res) => res.json({ ok: true }));
    const res = { json: jest.fn() };
    const next = jest.fn();

    await handler({}, res, next);

    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });

  test('FAILURE: forwards the error to next', async () => {
    const boom = new AppError('boom', 500);
    const handler = asyncHandler(async () => {
      throw boom;
    });
    const next = jest.fn();

    await handler({}, {}, next);

    expect(next).toHaveBeenCalledWith(boom);
  });
});