import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/lib/supabase/server";

const PUBLIC_ROUTES = ["/login", "/activate"];

async function getUserRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role as UserRole;
}

function redirect(request: NextRequest, path: string) {
  const url = new URL(path, request.url);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.cookies.toString());
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (!session) {
    if (isPublicRoute) {
      return response;
    }
    return redirect(request, "/login");
  }

  if (isPublicRoute) {
    const role = await getUserRole(supabase, session.user.id);
    if (!role) {
      return redirect(request, "/login");
    }
    return role === "parent"
      ? redirect(request, "/family")
      : redirect(request, "/staff");
  }

  const role = await getUserRole(supabase, session.user.id);

  if (!role) {
    return redirect(request, "/login");
  }

  if (pathname === "/") {
    return role === "parent"
      ? redirect(request, "/family")
      : redirect(request, "/staff");
  }

  if (pathname.startsWith("/staff")) {
    if (role === "parent") {
      return redirect(request, "/family");
    }
    return response;
  }

  if (pathname.startsWith("/family")) {
    if (role === "staff" || role === "admin") {
      return redirect(request, "/staff");
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
