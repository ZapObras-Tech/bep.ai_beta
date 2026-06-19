import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Junta classes condicionais (clsx) e resolve conflitos do Tailwind (twMerge),
// para que `className` passado a um primitivo sobrescreva o default sem duplicar.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
