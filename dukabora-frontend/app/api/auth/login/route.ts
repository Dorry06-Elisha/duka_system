import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { signToken } from "@/lib/auth";

type LoginUserRow = RowDataPacket & {
  id: number;
  name: string;
  username: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };

    const username = body.username?.trim();
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
    }

    const [rows] = await pool.execute<LoginUserRow[]>(
      "SELECT id, name, username, password FROM dukabora.users WHERE username = ? LIMIT 1",
      [username],
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }

    const token = signToken({ userId: user.id, username: user.username, name: user.name });

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, username: user.username },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to log in right now." },
      { status: 500 },
    );
  }
}
