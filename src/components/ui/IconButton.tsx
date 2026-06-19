import React from 'react';
import { cn } from '../../lib/ui/cn';

// Botão só-ícone acessível. Resolve de uma vez os três problemas recorrentes do
// app: alvo de clique pequeno (força 44x44), rótulo ausente para leitor de tela
// (`aria-label` obrigatório) e foco de teclado invisível (anel focus-visible).
//
// `no-print` (default true) marca o botão como chrome de UI, escondido no PDF via
// a regra `.no-print` do index.css — substitui os seletores frágeis antigos.

type Variant = 'default' | 'danger' | 'grip';

const VARIANTS: Record<Variant, string> = {
  default: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100',
  danger: 'text-slate-400 hover:text-red-600 hover:bg-red-50',
  grip: 'text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-grab active:cursor-grabbing',
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Rótulo para leitor de tela — obrigatório em botão só-ícone. */
  'aria-label': string;
  variant?: Variant;
  /** Esconder no print (chrome de UI). Default true. */
  noPrint?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'default', noPrint = true, className, type, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        noPrint && 'no-print',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

IconButton.displayName = 'IconButton';
