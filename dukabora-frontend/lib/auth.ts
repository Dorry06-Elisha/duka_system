import jwt from "jsonwebtoken";

export type AuthUser = {
  userId: number;
  username: string;
  name?: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "development-secret";

export function signToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthUser;
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export function requireAuth(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    return verifyToken(token);
  } catch {
    throw new Error("Unauthorized");
  }
}
