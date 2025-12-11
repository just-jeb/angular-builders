import type http from 'node:http';
export type Middleware = (req: http.IncomingMessage, res: http.ServerResponse, next: (err?: unknown) => void) => void;
