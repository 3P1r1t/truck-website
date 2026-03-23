import jwt from "jsonwebtoken";
import { AdminRole } from "@prisma/client";

export type JwtAdminPayload = {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
};

const DEFAULT_EXPIRES_IN = "7d";

function jwtSecret() {
  return process.env.JWT_SECRET || "dev-jwt-secret-change-this";
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
