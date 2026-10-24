import { apiErrorText } from "../lib/apiErrorText";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details: unknown;
  };
}

interface FetchResult<TData> {
  data?: TData;
  error?: ErrorBody;
  response: Response;
}

/** The message is the Russian text for the code (apiErrorText); details stay as sent. */
export function toApiError(response: Response, error?: ErrorBody): ApiError {
  const body = error?.error;
  const code = body?.code ?? (response.status === 429 ? "rate_limited" : "unknown_error");
  return new ApiError(response.status, code, apiErrorText(code), body?.details ?? null);
}

/** Unwraps a `{data: T, meta}` success envelope, throwing ApiError from the `{error}` envelope on failure. */
export async function unwrap<T>(result: Promise<FetchResult<{ data: T }>>): Promise<T> {
  const { data, error, response } = await result;
  if (error || !data) {
    throw toApiError(response, error);
  }
  return data.data;
}

interface PageMeta {
  total: number;
  limit: number;
  offset: number;
}

/** Unwraps a `{data: T[], meta: {total, limit, offset}}` paginated envelope. */
export async function unwrapPage<T>(
  result: Promise<FetchResult<{ data: T[]; meta: PageMeta }>>,
): Promise<{ items: T[]; meta: PageMeta }> {
  const { data, error, response } = await result;
  if (error || !data) {
    throw toApiError(response, error);
  }
  return { items: data.data, meta: data.meta };
}

/** For endpoints with a bare 204 response (no body) — DELETE /admin/users/{id}. */
export async function unwrapVoid(result: Promise<{ error?: ErrorBody; response: Response }>): Promise<void> {
  const { error, response } = await result;
  if (error) {
    throw toApiError(response, error);
  }
}
