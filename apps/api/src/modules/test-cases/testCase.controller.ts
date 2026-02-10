import { Response } from "express";
import { AuthenticatedRequest } from "../../types/auth-request";
import { createTestCaseSchema } from "./testCase.schema";
import { createTestCase } from "./testCase.service";

export async function createTestCaseController(
  req: AuthenticatedRequest,
  res: Response
) {
  const userId = req.user.id;

  const parsed = createTestCaseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
  }

  const testCase = await createTestCase(parsed.data, userId);

  return res.status(201).json({
    message: "Test case created successfully",
    data: testCase,
  });
}
