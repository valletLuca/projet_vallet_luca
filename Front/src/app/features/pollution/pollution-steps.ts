import { StepperStep } from '../../shared/ui/stepper-header/stepper-header';

export const POLLUTION_STEPS: readonly StepperStep[] = [
  {
    label: 'Quoi',
    title: "Qu'avez-vous observé ?",
    description: 'Décrivez la pollution en quelques mots.',
  },
  {
    label: 'Où et quand',
    title: 'Où et quand ?',
    description: 'Situez précisément votre observation.',
  },
  {
    label: 'Preuve',
    title: 'Une photo pour appuyer ?',
    description: 'Facultatif, mais très utile pour qualifier le signalement.',
  },
];
