/**
 * Error thrown by every request made through `lib/api/request.js`.
 *
 *  - `status`  HTTP status code (undefined when the request never reached the
 *              server, e.g. a network failure – those are plain `TypeError`s).
 *  - `message` What the server said. Usually a string, but validation failures
 *              come back as an array of `{ field, message }` objects, so it is
 *              deliberately NOT coerced to a string.
 *  - `code`    Optional machine readable code sent by the server.
 */
export class ApiError extends Error {
  constructor({ status, message, code } = {}) {
    super(typeof message === 'string' ? message : 'Request Failed');
    this.name = 'ApiError';
    this.status = status;
    this.message = message;
    this.code = code;
  }
}

/** The request never reached the server (offline, DNS, CORS, ...). */
export const isNetworkError = (err) => !err?.status;

/** The server answered with a 5xx. */
export const isServerError = (err) => err?.status >= 500;

/**
 * Message sent by the server, or `fallback` when the error did not come from
 * the server (network failure, local exception, ...).
 */
export const getErrorMessage = (err, fallback) =>
  err instanceof ApiError ? err.message : fallback;

/**
 * Validation errors are returned as `[{ field, message }]`.
 * Returns `{ [field]: message }`, or `null` when the error is not one.
 */
export const getFieldErrors = (err) => {
  if (!Array.isArray(err?.message)) return null;

  return err.message.reduce((fields, { field, message }) => {
    fields[field] = message;
    return fields;
  }, {});
};

/**
 * Turns a failed request into a user facing message using the same three
 * tiers everywhere: no connection / server error / anything else.
 *
 *  - `network`  shown when the request never reached the server
 *  - `server`   shown for 5xx responses (skipped when omitted, so the server
 *               message is used instead)
 *  - `fallback` used when there is no server message to show
 *  - `useApiMessage` set to `false` to always show `fallback` for 4xx
 */
export const describeError = (
  err,
  { network, server, fallback, useApiMessage = true } = {}
) => {
  if (isNetworkError(err)) return network;
  if (server !== undefined && isServerError(err)) return server;
  return useApiMessage ? getErrorMessage(err, fallback) : fallback;
};
