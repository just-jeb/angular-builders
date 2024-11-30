import type http from 'node:http';

// This is the inline type used by the `@angular-devkit/build-angular:dev-server`
// executor; however, it is not exposed as a type.
export type Middleware = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: (err?: unknown) => void
) => void;
