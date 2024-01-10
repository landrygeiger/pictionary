import { encode } from "jwt-simple";

export type Payload = {
  name: string;
  sessionId: string;
};

export const createJWT = (payload: Payload) =>
  encode(payload, process.env.SECRET_KEY || "secret", "HS512");
