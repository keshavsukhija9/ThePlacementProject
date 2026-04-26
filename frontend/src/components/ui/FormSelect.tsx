"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      success,
      hint,
      options,
      placeholder,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const isValid = success && !hasError;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-on-surface">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`
              w-full px-3 py-2 pr-9 rounded-md border transition-all duration-200
              bg-surface text-on-surface placeholder-on-surface-variant
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
              disabled:opacity-50 disabled:cursor-not-allowed appearance-none
              ${
                hasError
                  ? "border-error focus:ring-error"
                  : isValid
                    ? "border-success focus:ring-success"
                    : "border-border focus:border-primary focus:ring-primary"
              }
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            strokeWidth={1.5}
          />

          {isValid && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-9 top-1/2 -translate-y-1/2 text-success"
            >
              <CheckCircle2 size={16} strokeWidth={2} />
            </motion.div>
          )}

          {hasError && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-9 top-1/2 -translate-y-1/2 text-error"
            >
              <AlertCircle size={16} strokeWidth={2} />
            </motion.div>
          )}
        </div>

        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-error flex items-center gap-1"
          >
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}

        {!hasError && hint && (
          <p className="text-xs text-on-surface-variant">{hint}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
