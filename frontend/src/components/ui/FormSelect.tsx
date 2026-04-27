"use client";

import { forwardRef, SelectHTMLAttributes, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { COLORS, SHADOWS, FOCUS, INPUT, RADIUS, EASING, TIMING, TYPOGRAPHY } from "@/lib/design-system";

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
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = !!error;
    const isValid = success && !hasError;

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="label" style={{ fontSize: TYPOGRAPHY.micro, fontWeight: 600, letterSpacing: 0.12, textTransform: 'uppercase', color: COLORS.txtDim }}>
            {label}
            {props.required && <span style={{ color: COLORS.error, marginLeft: 4 }}>*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            style={{
              width: '100%',
              height: INPUT.height,
              padding: `0 ${INPUT.padding.horizontal}px`,
              paddingRight: INPUT.padding.horizontal + 24,
              background: COLORS.surface2,
              border: `${BORDER.width} ${BORDER.style} ${hasError ? COLORS.error : isValid ? COLORS.success : COLORS.border}`,
              borderRadius: RADIUS.sm,
              boxShadow: SHADOWS.inset,
              color: COLORS.txt,
              fontFamily: 'var(--font-mono)',
              fontSize: TYPOGRAPHY.body,
              fontWeight: 400,
              letterSpacing: 0,
              lineHeight: TYPOGRAPHY.normal,
              outline: 'none',
              transition: `border-color ${TIMING.snap} ${EASING.lock}, box-shadow ${TIMING.snap} ${EASING.lock}`,
              appearance: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: COLORS.txtDim, strokeWidth: 1.5 }}
          />

          {isValid && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: COLORS.success }}
            >
              <CheckCircle2 size={16} strokeWidth={2} />
            </motion.div>
          )}

          {hasError && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: COLORS.error }}
            >
              <AlertCircle size={16} strokeWidth={2} />
            </motion.div>
          )}
        </div>

        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-small"
            style={{ color: COLORS.error, fontSize: TYPOGRAPHY.small, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}

        {!hasError && hint && (
          <p className="text-small" style={{ color: COLORS.txtDim, fontSize: TYPOGRAPHY.small }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";

// Helper for border width
const BORDER = {
  width: '0.5px',
  style: 'solid',
  color: COLORS.border,
  colorHi: COLORS.borderHi,
};
