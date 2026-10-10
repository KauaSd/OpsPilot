import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { Request, Response } from "express";

interface ErrorBody {
  statusCode: number;
  code: string;
  message: string | string[];
  requestId: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId =
      (request as Request & { id?: string }).id ?? randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message: string | string[] = "Erro interno inesperado";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const obj = res as Record<string, unknown>;
        message = (obj.message as string | string[]) ?? exception.message;
        code = (obj.code as string) ?? this.codeFromStatus(status);
      }
      if (Array.isArray(message)) {
        code = "VALIDATION_ERROR";
      }
    }

    const body: ErrorBody = {
      statusCode: status,
      code,
      message,
      requestId,
    };

    response.status(status).json(body);
  }

  private codeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "BAD_REQUEST";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      case HttpStatus.CONFLICT:
        return "CONFLICT";
      case HttpStatus.TOO_MANY_REQUESTS:
        return "RATE_LIMITED";
      case HttpStatus.BAD_GATEWAY:
        return "AI_UPSTREAM_ERROR";
      case HttpStatus.SERVICE_UNAVAILABLE:
        return "AI_BUSY";
      case HttpStatus.GATEWAY_TIMEOUT:
        return "AI_TIMEOUT";
      default:
        return "ERROR";
    }
  }
}
