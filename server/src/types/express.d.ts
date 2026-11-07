declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth from the JWT subject. */
      user?: { id: string };
    }
  }
}

export {};
