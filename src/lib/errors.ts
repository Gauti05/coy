export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class AlreadySwipedError extends ConflictError {
  constructor(message = "Already swiped on this profile") {
    super(message);
  }
}

/** Map typed domain errors to HTTP status + message (no stack traces). */
export function mapErrorToHttp(error: unknown): {
  status: number;
  message: string;
} {
  if (error instanceof AppError) {
    return { status: error.statusCode, message: error.message };
  }

  return { status: 500, message: "Internal server error" };
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}
