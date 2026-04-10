import { ZodError } from "zod";
import { NextResponse } from "next/server";

function getColorLabApiErrorStatus(error: unknown) {
  if (
    error instanceof Error &&
    error.message === "Unauthorized wiki admin request."
  ) {
    return 401;
  }

  if (error instanceof ZodError) {
    return 400;
  }

  return 500;
}

export function buildColorLabApiErrorResponse(
  error: unknown,
  fallbackMessage: string
) {
  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : fallbackMessage,
    },
    { status: getColorLabApiErrorStatus(error) }
  );
}
