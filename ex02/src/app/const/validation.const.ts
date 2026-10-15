/** Longueurs utilisées à la fois par les validateurs et par les attributs `maxlength` du template. */
export const FIELD_LIMITS = {
  nameMaxLength: 50,
  emailMaxLength: 254,
  passwordMinLength: 8,
  passwordMaxLength: 64,
} as const;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const LETTER_PATTERN = /\p{L}/u;
export const DIGIT_PATTERN = /\d/;

/** Règles affichées en direct sous le champ mot de passe. */
export const PASSWORD_RULES = [
  {
    label: `${FIELD_LIMITS.passwordMinLength} caractères minimum`,
    test: (value: string) => value.length >= FIELD_LIMITS.passwordMinLength,
  },
  { label: 'Une lettre', test: (value: string) => LETTER_PATTERN.test(value) },
  { label: 'Un chiffre', test: (value: string) => DIGIT_PATTERN.test(value) },
] as const;
