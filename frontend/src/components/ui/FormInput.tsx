"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      icon,
      showPasswordToggle,
      maxLength,
      showCharCount,
      type = "text",
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const inputType = showPasswordToggle && showPassword ? "text" : type;
    const hasError = !!error;
    const isValid = success && !hasError;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showCharCount) {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-on-surface">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            maxLength={maxLength}
            className={`
              w-full px-3 py-2 rounded-md border transition-all duration-200
              bg-surface text-on-surface placeholder-on-surface-variant
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? "pl-9" : ""}
              ${
                hasError
                  ? "border-error focus:ring-error"
                  : isValid
                    ? "border-success focus:ring-success"
                    : "border-border focus:border-primary focus:ring-primary"
              }
            `}
            {...props}
          />

          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.5} />
              ) : (
                <Eye size={16} strokeWidth={1.5} />
              )}
            </button>
          )}

          {isValid && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-success"
            >
              <CheckCircle2 size={16} strokeWidth={2} />
            </motion.div>
          )}

          {hasError && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-error"
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

        {showCharCount && maxLength && (
          <p className="text-xs text-on-surface-variant text-right">
            {charCount} / {maxLength}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
