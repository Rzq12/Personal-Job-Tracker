type HeaderMap = Record<string, string | undefined>;

export interface MockRequest {
  method?: string;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: HeaderMap;
  user?: { userId: number; email: string };
}

export interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  ended: boolean;
  status: (code: number) => MockResponse;
  json: (payload: unknown) => MockResponse;
  send: (payload: unknown) => MockResponse;
  end: () => MockResponse;
  setHeader: (name: string, value: string) => void;
}

export function createMockRequest(input: MockRequest = {}): MockRequest {
  return {
    method: input.method || 'GET',
    query: input.query || {},
    body: input.body || {},
    headers: input.headers || {},
    user: input.user,
  };
}

export function createMockResponse(): MockResponse {
  const response: MockResponse = {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(payload: unknown) {
      response.body = payload;
      response.ended = true;
      return response;
    },
    send(payload: unknown) {
      response.body = payload;
      response.ended = true;
      return response;
    },
    end() {
      response.ended = true;
      return response;
    },
    setHeader(name: string, value: string) {
      response.headers[name] = value;
    },
  };

  return response;
}
