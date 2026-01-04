import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.NEXT_PUBLIC_JWT_SECRET || "your-super-secret-jwt-key";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions?: string[];
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
