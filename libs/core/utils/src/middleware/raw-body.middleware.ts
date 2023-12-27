import { json } from 'body-parser';
import { Request, Response } from 'express';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

function rawBodyMiddleware() {
  return json({
    verify: (req: RequestWithRawBody, res: Response, buf: Buffer) => {
      if (req.url === '/api/stripe/webhook' && Buffer.isBuffer(buf)) {
        req.rawBody = Buffer.from(buf);
      }

      return true;
    },
  });
}

export { rawBodyMiddleware };
