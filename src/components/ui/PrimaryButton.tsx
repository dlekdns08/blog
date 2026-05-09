import type { ButtonHTMLAttributes, ReactNode } from "react";

type Size = "sm" | "md";
type Variant = "primary" | "secondary";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  variant?: Variant;
  children: ReactNode;
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-violet-600 hover:bg-violet-700 text-white disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500",
  secondary:
    "border border-line bg-surface hover:border-accent text-body hover:text-accent",
};

/**
 * 사이트 표준 액션 버튼.
 * `<PrimaryButton variant="primary" size="md">+ 새 글</PrimaryButton>`
 */
export function PrimaryButton({
  size = "md",
  variant = "primary",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors disabled:cursor-not-allowed ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
