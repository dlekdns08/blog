import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

const BASE =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-body placeholder-subtle focus:border-accent focus:ring-2 focus:ring-violet-500/15 outline-none transition-colors disabled:opacity-60";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode };
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
};

/**
 * 사이트 표준 텍스트 입력 — 댓글, 구독, 검색 등 폼에서 공유.
 */
export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  function FormInput({ label, className = "", id, ...rest }, ref) {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-muted">
            {label}
          </label>
        )}
        <input ref={ref} id={id} className={`${BASE} ${className}`} {...rest} />
      </div>
    );
  }
);

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function FormTextarea({ label, className = "", id, ...rest }, ref) {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`${BASE} resize-y ${className}`}
          {...rest}
        />
      </div>
    );
  }
);
