import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import db from "@/lib/db";

type ExistingUserRow = RowDataPacket & { id: number };

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      username?: string;
      password?: string;
      role?: string;
    };

    const name = body.name?.trim();
    const username = body.username?.trim();
    const password = body.password;
    const role = body.role?.trim() || "seller";

    if (!name || !username || !password) {
      return NextResponse.json({ message: "Name, username, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const [existingUsers] = await db.execute<ExistingUserRow[]>(
      "SELECT id FROM dukabora.users WHERE username = ? LIMIT 1",
      [username],
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "That username is already in use." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO dukabora.users (name, username, password, role) VALUES (?, ?, ?, ?)",
      [name, username, passwordHash, role],
    );

    return NextResponse.json(
      { user: { id: result.insertId, name, username, role } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to create the account right now. Please try again." },
      { status: 500 },
    );
  }
}