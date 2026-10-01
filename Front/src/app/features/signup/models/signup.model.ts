/** Données saisies dans le formulaire d'inscription (liées via ngModel). */
export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  password: string;
  passwordConfirm: string;
}

export type SignupResult = Omit<SignupData, 'password' | 'passwordConfirm'>;

export interface SignupStep {
  label: string;
  title: string;
  description: string;
}

export const SIGNUP_STEPS: readonly SignupStep[] = [
  {
    label: 'Identité',
    title: 'Qui êtes-vous ?',
    description: 'Commençons par faire connaissance.',
  },
  {
    label: 'Compte',
    title: 'Vos identifiants',
    description: 'Ils vous serviront à vous connecter.',
  },
  {
    label: 'Sécurité',
    title: 'Protégez votre compte',
    description: 'Choisissez un mot de passe robuste.',
  },
];
