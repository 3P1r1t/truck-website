import jwt from "jsonwebtoken";
import { AdminRole } from "@prisma/client";

export type JwtAdminPayload = {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
};

const DEFAULT_EXPIRES_IN = "7d";
const INSECURE_JWT_SECRETS = new Set(["change-me-in-production", "dev-jwt-secret-change-this"]);

function jwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  if (INSECURE_JWT_SECRETS.has(secret)) {
    throw new Error("JWT_SECRET uses an insecure placeholder value");
  }
  return secret;
}

export function signAdminToken(payload: JwtAdminPayload) {
  const expiresIn = (process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN) as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, jwtSecret(), { expiresIn });
}

export function verifyAdminToken(token: string): JwtAdminPayload {
  return jwt.verify(token, jwtSecret()) as JwtAdminPayload;
}

export function parseBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader) {
    return null;
  }

  const [type, token] = authorizationHeader.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}
