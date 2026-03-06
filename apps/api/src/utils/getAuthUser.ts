import { AuthenticatedRequest } from '../types/auth-request';

export function getAuthUser(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new Error('Unauthorized: User missing from request');
  }
  return req.user;
}
