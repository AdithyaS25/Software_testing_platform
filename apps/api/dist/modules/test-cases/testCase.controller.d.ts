import { Response } from "express";
import { AuthenticatedRequest } from "../../types/auth-request";
export declare function createTestCaseController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listTestCasesController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getTestCaseByIdController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateTestCaseController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function cloneTestCaseController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteTestCaseController(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=testCase.controller.d.ts.map