// FILENAME: src/middlewares/userContext.ts
import { Request, Response, NextFunction } from "express";
import { RequestUser } from "./context";
import { User } from "@db/index";

export interface RequestContext {
  requestId: string;
  user?: RequestUser;
  appUser?: User;

}

export function userContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // Ici, tu es sûr d’avoir:
  // - req.context.user (Keycloak)
  // - req.context.appUser (HomeLedger)
  // Tu peux ajouter des infos métier, ex:
  //
  // req.context = {
  //   ...req.context,
  //   defaultAccountId: ...,
  //   familyId: ...
  // };

  next();
}