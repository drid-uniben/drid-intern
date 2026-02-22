import { NextRequest, NextResponse } from "next/server";

const resolveBackendApiBase = (): string => {
  const raw = process.env.API_URL;

  if (!raw || raw.trim().length === 0) {
    throw new Error("Missing required env: API_URL");
  }

  const normalized = raw.trim();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    throw new Error("Invalid API_URL: must start with http:// or https://");
  }

  return normalized.replace(/\/$/, "");
};

const buildTargetUrl = (request: NextRequest, path: string[]): URL => {
  const url = new URL(`${resolveBackendApiBase()}/${path.join("/")}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url;
};

const toForwardHeaders = (request: NextRequest): Headers => {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  return headers;
};

const proxy = async (request: NextRequest, path: string[]): Promise<NextResponse> => {
  try {
    const targetUrl = buildTargetUrl(request, path);
    const method = request.method;

    const init: RequestInit = {
      method,
      headers: toForwardHeaders(request),
      cache: "no-store",
    };

    if (method !== "GET" && method !== "HEAD") {
      init.body = await request.text();
    }

    const upstreamResponse = await fetch(targetUrl, init);
    const payload = await upstreamResponse.arrayBuffer();

    return new NextResponse(payload, {
      status: upstreamResponse.status,
      headers: upstreamResponse.headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy request failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
};

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const getPathFromContext = async (context: RouteContext): Promise<string[]> => {
  const { path } = await context.params;
  return path;
};

export const GET = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
  return proxy(request, await getPathFromContext(context));
};

export const POST = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
  return proxy(request, await getPathFromContext(context));
};

export const PATCH = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
  return proxy(request, await getPathFromContext(context));
};

export const PUT = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
  return proxy(request, await getPathFromContext(context));
};

export const DELETE = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
  return proxy(request, await getPathFromContext(context));
};
