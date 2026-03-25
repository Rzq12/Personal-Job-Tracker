beforeEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();

  // Block accidental network calls in tests by default.
  global.fetch = jest.fn(async () => {
    throw new Error('Unexpected real network call in test');
  }) as unknown as typeof fetch;
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.useRealTimers();
});
