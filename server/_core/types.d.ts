declare namespace Express {
  interface Request {
    userId?: number;
    advertiserId?: number;
    user?: any;
    file?: any;
    files?: any;
  }
}

declare module 'better-sqlite3';
declare module '@manus/sdk';
declare module 'multer';
