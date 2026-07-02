import { NextResponse } from "next/server";
import { registerUser, createSession, sanitizeUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, first_name, last_name, role, date_of_birth, id_file_path } = body;

    if (!email || !password || !first_name || !last_name || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!["buyer", "seller"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (role === "seller" && !id_file_path) {
      return NextResponse.json({ error: "ID file is required for sellers" }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.queryOne<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await registerUser({
      email,
      password,
      first_name,
      last_name,
      role,
      date_of_birth,
      id_file_path,
    });

    const token = await createSession(user.id);
    const url = new URL(req.url);
    const response = NextResponse.json({ user: sanitizeUser(user) }, { status: 201 });
    response.cookies.set("session_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: url.protocol === "https:",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
