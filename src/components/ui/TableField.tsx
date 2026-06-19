import React from 'react';
import { cn } from '../../lib/ui/cn';

// Campos de célula de tabela com afford visível. Os antigos eram
// `bg-transparent border-transparent` — sem pista de que eram editáveis. Aqui o
// repouso já mostra fundo+borda sutil; foco reforça com anel laranja.
//
// No print os campos voltam a ser texto limpo: as regras `input,textarea{border:
// none;background:transparent}` do index.css neutralizam estes estilos.

const base =
  'w-full rounded-md bg-slate-50 border border-slate-200 px-2.5 py-2 text-sm text-slate-800 ' +
  'transition-colors placeholder:text-slate-400 hover:bg-white ' +
  'focus:bg-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export const TableTextField = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input ref={ref} type={type} className={cn(base, className)} {...props} />
  ),
);
TableTextField.displayName = 'TableTextField';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;
export const TableSelectField = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(base, 'cursor-pointer', className)} {...props}>
      {children}
    </select>
  ),
);
TableSelectField.displayName = 'TableSelectField';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export const TableTextArea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(base, 'resize-y min-h-[60px]', className)} {...props} />
  ),
);
TableTextArea.displayName = 'TableTextArea';
