export type ApiError = {
  code: string;
  message: string;
};

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
};

export function ok<T>(data: T): ApiResponse<T> {
  return { data, error: null };
}

export function fail(code: string, message: string): ApiResponse<null> {
  return { data: null, error: { code, message } };
}

export function jsonResponse<T>(data: T, status = 200) {
  return Response.json(ok(data), { status });
}

export function jsonError(code: string, message: string, status = 400) {
  return Response.json(fail(code, message), { status });
}
