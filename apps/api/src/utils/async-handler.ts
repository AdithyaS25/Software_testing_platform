import { Request, Response, NextFunction, RequestHandler } from "express";

export function asHandler(
  fn: (req: any, res: Response, next: NextFunction) => any
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
