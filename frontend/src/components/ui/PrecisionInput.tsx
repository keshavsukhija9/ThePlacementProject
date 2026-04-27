"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { COLORS, SHADOWS, FOCUS, INPUT, RADIUS, EASING, TIMING, TYPOGRAPHY } from "@/lib/design-system";

interface PrecisionInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

export const PrecisionInput = forwardRef<HTMLInputElement, PrecisionInputProps>(
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
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle && showPassword ? "text" : type;
    const hasError = !!error;
    const isValid = success && !hasError;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showCharCount) {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Focus state with engineered motion
    const focusStyle = {
      borderColor: isFocused ? COLORS.primary : hasError ? COLORS.error : isValid ? COLORS.success : COLORS.border,
      boxShadow: isFocused
        ? `${SHADOWS.inset}, 0 0 0 1px ${FOCUS.glow}`
        : hasError
          ? `${SHADOWS.inset}, 0 0 0 1px rgba(239 68 68 / 0.2)`
          : isValid
            ? `${SHADOWS.inset}, 0 0 0 1px rgba(16 185 129 / 0.2)`
            : SHADOWS.inset,
      transition: `border-color ${TIMING.snap} ${EASING.lock}, box-shadow ${TIMING.snap} ${EASING.lock}`,
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
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.txtDim }}>
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            maxLength={maxLength}
            style={{
              width: '100%',
              height: INPUT.height,
              padding: `0 ${INPUT.padding.horizontal}px`,
              paddingLeft: icon ? INPUT.padding.horizontal + 24 : INPUT.padding.horizontal,
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
              disabled: disabled ? 'opacity-50 cursor-not-allowed' : undefined,
            }}
            {...props}
          />

          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              tabIndex={-1}
              style={{ color: COLORS.txtDim, cursor: 'pointer' }}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: COLORS.success }}
            >
              <CheckCircle2 size={16} strokeWidth={2} />
            </motion.div>
          )}

          {hasError && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
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

        {showCharCount && maxLength && (
          <p className="text-mono" style={{ color: COLORS.txtDim, fontSize: TYPOGRAPHY.micro, textAlign: 'right' }}>
            {charCount} / {maxLength}
          </p>
        )}
      </div>
    );
  }
);

PrecisionInput.displayName = "PrecisionInput";

// Helper for border width
const BORDER = {
  width: '0.5px',
  style: 'solid',
  color: COLORS.border,
  colorHi: COLORS.borderHi,
};
