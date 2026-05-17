import { NextResponse, type NextRequest } from "next/server";

function adminAuthIsConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

function isProtectedListingsRequest(request: NextRequest) {
  return (
    request.nextUrl.pathname.startsWith("/api/listings") &&
    request.method !== "POST"
  );
}

function isProtectedPath(request: NextRequest) {
  return (
    request.nextUrl.pathname.startsWith("/admin") ||
    isProtectedListingsRequest(request)
  );
}

function unauthorized() {
  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Motordata Admin"',
    },
  });
}

export function proxy(request: NextRequest) {
  if (!isProtectedPath(request)) {
    return NextResponse.next();
  }

  if (!adminAuthIsConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse(
        "Faltan ADMIN_USERNAME y ADMIN_PASSWORD en variables de entorno.",
        { status: 503 }
      );
    }

    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return unauthorized();

  const credentials = atob(authorization.replace("Basic ", ""));
  const [username, password] = credentials.split(":");

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/listings/:path*"],
};
