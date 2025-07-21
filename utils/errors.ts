export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(404, message, "NOT_FOUND");
  }
}

export class ScrapingError extends ApiError {
  constructor(message: string = "Failed to scrape Instagram data") {
    super(500, message, "SCRAPING_ERROR");
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: error.message,
        code: error.code,
      },
    };
  }

  console.error("Unexpected error:", error);

  return {
    status: 500,
    body: {
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  };
}
