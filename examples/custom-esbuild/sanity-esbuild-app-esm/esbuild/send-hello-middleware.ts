import type { NextHandleFunction } from 'connect';

const sendHelloMiddleware: NextHandleFunction = (req, res, next) => {
  if (req.url === '/send-hello') {
    res.end('<h1>Hello text from middleware!</h1>');
  } else {
    next();
  }
};

export default sendHelloMiddleware;
