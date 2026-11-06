import { SignInErrorReason, SignUpErrorReason } from '../features/auth/models/user.model';

export const SIGN_UP_ERROR_MESSAGES: Record<SignUpErrorReason, string> = {
  'email-taken': 'Un compte existe déjà avec cette adresse e-mail.',
  'invalid-data': 'Les informations saisies ont été refusées. Vérifiez-les puis réessayez.',
  network: "Le serveur est injoignable. Vérifiez votre connexion ou que l'API est bien démarrée.",
  server: 'Le serveur a rencontré une erreur. Réessayez dans quelques instants.',
};

export const SIGN_IN_ERROR_MESSAGES: Record<SignInErrorReason, string> = {
  'invalid-credentials': 'E-mail ou mot de passe incorrect.',
  network: SIGN_UP_ERROR_MESSAGES.network,
  server: SIGN_UP_ERROR_MESSAGES.server,
};
