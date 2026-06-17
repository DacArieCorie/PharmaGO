import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Données invalides", details: err.issues });
  }
  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
  console.error(err);
  return res.status(500).json({ error: "Erreur serveur" });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
