import { IUserPayload } from './index.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}
