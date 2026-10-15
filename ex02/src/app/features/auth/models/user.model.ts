/** Données envoyées à l'API pour créer un compte. */
export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Utilisateur renvoyé par l'API (le mot de passe n'est jamais exposé côté front). */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export type SignUpErrorReason = 'email-taken' | 'network' | 'server';

/** Erreur métier émise par AuthService : le composant n'a pas à connaître HttpErrorResponse. */
export class SignUpError extends Error {
  constructor(readonly reason: SignUpErrorReason) {
    super(reason);
    this.name = 'SignUpError';
  }
}
