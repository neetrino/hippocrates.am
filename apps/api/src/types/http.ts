import type { Request } from "express";
import type { Actor } from "../identity/access";

export type AppRequest = Request & {
  actor?: Actor;
  requestId?: string;
};
