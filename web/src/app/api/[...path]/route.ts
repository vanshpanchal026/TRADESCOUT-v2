import { NextResponse } from "next/server";

export const runtime = "edge";

const BACKEND_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function getAllowedOrigin(request: Request): string {
  const envOrigins =
    process.env.CORS_ORIGINS ||
    process.env.ALLOWED_ORIGINS ||
    "http://localhost:3000,http://127.0.0.1:3000";

  let allowedList: string[] = [];
  try {
    if (envOrigins.startsWith("[") && envOrigins.endsWith("]")) {
      allowedList = JSON.parse(envOrigins);
    } else {
      allowedList = envOrigins.split(",").map((s) => s.trim());
    }
  } catch {
    allowedList = envOrigins.split(",").map((s) => s.trim());
  }

  const origin = request.headers.get("origin");
  if (origin && (allowedList.includes(origin) || allowedList.includes("*"))) {
    return origin;
  }
  return allowedList[0] || "http://localhost:3000";
}

/**
 * Handle CORS preflight options requests.
 */
export async function OPTIONS(request: Request) {
  const allowedOrigin = getAllowedOrigin(request);
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, x-request-id, X-Request-ID",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    },
  });
}

/**
 * Core proxy handler for Next.js Edge runtime.
 */
async function proxyRequest(request: Request, path: string[]) {
  const url = new URL(request.url);
  const targetPath = path.join("/");
  const targetUrl = `${BACKEND_BASE_URL}/api/${targetPath}${url.search}`;
  const allowedOrigin = getAllowedOrigin(request);

  const forwardHeaders = new Headers();

  // Forward critical headers
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    forwardHeaders.set("authorization", authHeader);
  }

  const reqId = request.headers.get("x-request-id") || crypto.randomUUID();
  forwardHeaders.set("x-request-id", reqId);

  const contentType = request.headers.get("content-type");
  if (contentType) {
    forwardHeaders.set("content-type", contentType);
  }

  const acceptHeader = request.headers.get("accept");
  if (acceptHeader) {
    forwardHeaders.set("accept", acceptHeader);
  }

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: forwardHeaders,
      redirect: "follow",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = request.body;
      // @ts-expect-error duplex required for streaming bodies in Edge runtime fetch
      fetchOptions.duplex = "half";
    }

    const backendResponse = await fetch(targetUrl, fetchOptions);

    const responseHeaders = new Headers(backendResponse.headers);
    responseHeaders.set("Access-Control-Allow-Origin", allowedOrigin);
    responseHeaders.set("Vary", "Origin");
    responseHeaders.set("x-request-id", reqId);

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "proxy_error",
        message: `Failed to proxy request to backend: ${error instanceof Error ? error.message : String(error)}`,
      },
      {
        status: 502,
        headers: {
          "x-request-id": reqId,
          "Access-Control-Allow-Origin": allowedOrigin,
          "Vary": "Origin",
        },
      }
    );
  }
}

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}
