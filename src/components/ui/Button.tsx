import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/ui/cn';

// Botão com texto, alvo de 44px e foco visível. As variantes fixam pares de cor
// com contraste AA:
//  - primary:   laranja sólido / branco (CTA forte)
//  - secondary: branco / slate-700 com borda (ação neutra)
//  - accent:    orange-100 / orange-800 — substitui o par reprovado
//               orange-50 / orange-600 (~3:1) usado nos antigos botões de IA/Adicionar.

type Variant = 'primary' | 'secondary' | 'accent';
type Size = 'md' | 'sm';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-orange-600 text-white hover:bg-orange-700 border border-transparent',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  accent: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border border-transparent',
};

const SIZES: Record<Size, string> = {
  md: 'h-11 px-4 text-sm gap-2',
  sm: 'h-9 px-3 text-xs gap-1.5', // compacto para barras de tabela; ainda >=36px
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Ícone à esquerda (componente lucide). Trocado por spinner quando loading. */
  icon?: React.ReactNode;
  /** Esconder no print (chrome de UI). Default true. */
  noPrint?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, icon, noPrint = true, className, type, disabled, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type ?? 'button'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        noPrint && 'no-print',
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
