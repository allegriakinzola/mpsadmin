import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "https://mpservices.site",
  "https://www.mpservices.site",
  "https://admin.mpservices.site",
];

export function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export function handleCors(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  return null;
}

export function withCors(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
