import jwt from "jsonwebtoken";

type TokenPayload = {
  sub: string;
};

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secret;
};

export const signToken = (payload: TokenPayload) => {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, getSecret()) as TokenPayload;
};
