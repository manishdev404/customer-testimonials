/**
 * Errors thrown anywhere in the service layer. The error middleware turns these
 * into responses, so handlers never assemble error payloads by hand.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly fields: Record<string, string> | undefined;
  /** Distinguishes deliberate failures from genuine bugs when logging. */
  readonly expected: boolean;

  constructor(
    message: string,
    status: number,
    options: { fields?: Record<string, string>; expected?: boolean } = {},
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.fields = options.fields;
    this.expected = options.expected ?? true;
  }

  static badRequest(message: string, fields?: Record<string, string>): HttpError {
    return new HttpError(message, 400, { fields });
  }

  static unprocessable(message: string, fields?: Record<string, string>): HttpError {
    return new HttpError(message, 422, { fields });
  }

  static notFound(message = 'Resource not found.'): HttpError {
    return new HttpError(message, 404);
  }

  static payloadTooLarge(message: string): HttpError {
    return new HttpError(message, 413);
  }

  static internal(message = 'Something went wrong. Please try again.'): HttpError {
    return new HttpError(message, 500, { expected: false });
  }
}
