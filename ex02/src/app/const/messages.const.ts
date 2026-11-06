import { SignUpErrorReason } from '../features/auth/models/user.model';

export const SIGN_UP_ERROR_MESSAGES: Record<SignUpErrorReason, string> = {
  'email-taken': 'Un compte existe déjà avec cette adresse e-mail.',
  network: "Le serveur est injoignable. Vérifiez votre connexion ou que l'API est bien démarrée.",
  server: 'Le serveur a rencontré une erreur. Réessayez dans quelques instants.',
};
