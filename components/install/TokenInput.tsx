'use client';

import {
  useState,
  useRef,
  useEffect,
  ClipboardEvent,
  InputHTMLAttributes,
  forwardRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  ClipboardPaste,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  validating?: boolean;
  success?: boolean;
  error?: string;
  minLength?: number;
  autoSubmitLength?: number;
  onAutoSubmit?: () => void;
  showCharCount?: boolean;
  accentColor?: 'emerald' | 'blue' | 'orange' | 'red';
}

const accentColors = {
  emerald: {
    focus: 'focus-within:border-emerald-500 focus-within:shadow-[0_0_0_3px_theme(colors.emerald.500/0.15)]',
    validating: 'border-emerald-500/50',
    success: 'border-emerald-500 bg-emerald-500/10',
    icon: 'text-emerald-500',
  },
  blue: {
    focus: 'focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_theme(colors.blue.500/0.15)]',
    validating: 'border-blue-500/50',
    success: 'border-blue-500 bg-blue-500/10',
    icon: 'text-blue-500',
  },
  orange: {
    focus: 'focus-within:border-orange-500 focus-within:shadow-[0_0_0_3px_theme(colors.orange.500/0.15)]',
    validating: 'border-orange-500/50',
    success: 'border-orange-500 bg-orange-500/10',
    icon: 'text-orange-500',
  },
  red: {
    focus: 'focus-within:border-red-500 focus-within:shadow-[0_0_0_3px_theme(colors.red.500/0.15)]',
    validating: 'border-red-500/50',
    success: 'border-red-500 bg-red-500/10',
    icon: 'text-red-500',
  },
};

/**
 * Input especializado para tokens com:
 * - Máscara visual (•••••)
 * - Toggle de visibilidade
 * - Detecção de paste com feedback
 * - Auto-submit quando atinge tamanho mínimo
 * - Estados: default, focus, validating, success, error
 * - Shake animation em erro
 */
export const TokenInput = forwardRef<HTMLInputElement, TokenInputProps>(
  function TokenInput(
    {
      value,
      onChange,
      label,
      placeholder = 'Cole seu token aqui...',
      validating = false,
      success = false,
      error,
      minLength = 20,
      autoSubmitLength,
      onAutoSubmit,
      showCharCount = true,
      accentColor = 'emerald',
      disabled,
      className,
      ...props
    },
    ref
  ) {
    const [showValue, setShowValue] = useState(false);
    const [justPasted, setJustPasted] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    const colors = accentColors[accentColor];

    // Auto-submit quando atingir tamanho
    useEffect(() => {
      if (
        autoSubmitLength &&
        value.length >= autoSubmitLength &&
        !validating &&
        !error &&
        !success &&
        onAutoSubmit
      ) {
        const timer = setTimeout(onAutoSubmit, 800);
        return () => clearTimeout(timer);
      }
    }, [value, autoSubmitLength, validating, error, success, onAutoSubmit]);

    // Feedback visual de paste
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      setJustPasted(true);
      setTimeout(() => setJustPasted(false), 1500);
    };

    const isError = !!error;
    const isDisabled = disabled || validating || success;

    return (
      <div className={cn('relative', className)}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-[var(--ds-text-secondary)] mb-2">
            {label}
          </label>
        )}

        {/* Input container com shake em erro + pulse sutil quando vazio */}
        <motion.div
          animate={
            isError
              ? {
                  x: [-4, 4, -4, 4, -2, 2, 0],
                  transition: { duration: 0.4 },
                }
              : value.length === 0 && !validating && !success
                ? {
                    boxShadow: [
                      '0 0 0 1px currentColor',
                      '0 0 0 3px currentColor',
                      '0 0 0 1px currentColor',
                    ],
                    opacity: [0.3, 0.6, 0.3],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }
                : {}
          }
          className={cn(
            'relative flex items-center gap-2',
            'px-4 py-3 rounded-xl',
            'bg-[var(--ds-bg-surface)]/50 border',
            'transition-all duration-200',
            // Default state
            !isError &&
              !success &&
              !validating &&
              'border-[var(--ds-border-default)]',
            !isError && !success && !validating && colors.focus,
            // Validating
            validating && colors.validating,
            validating && 'animate-pulse',
            // Success
            success && colors.success,
            // Error
            isError &&
              'border-red-500 bg-red-500/10 shadow-[0_0_0_3px_theme(colors.red.500/0.15)]'
          )}
        >
          <input
            ref={inputRef}
            type={showValue ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={isDisabled}
            className={cn(
              'flex-1 bg-transparent outline-none',
              'text-[var(--ds-text-primary)] placeholder:text-[var(--ds-text-muted)]',
              'font-mono text-sm',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            {...props}
          />

          {/* Status icons */}
          <AnimatePresence mode="wait">
            {validating && (
              <motion.div
                key="validating"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2
                  className={cn('w-5 h-5 animate-spin', colors.icon)}
                />
              </motion.div>
            )}
            {success && !validating && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Check className={cn('w-5 h-5', colors.icon)} />
              </motion.div>
            )}
            {isError && !validating && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <X className="w-5 h-5 text-red-500" />
              </motion.div>
            )}
            {!validating && !success && !isError && value.length > 0 && (
              <motion.button
                key="toggle"
                type="button"
                onClick={() => setShowValue(!showValue)}
                className="text-[var(--ds-text-muted)] hover:text-[var(--ds-text-secondary)] transition-colors p-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {showValue ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bottom row: paste indicator / error / char count */}
        <div className="flex items-center justify-between mt-2 min-h-[20px]">
          {/* Paste indicator */}
          <AnimatePresence>
            {justPasted && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'flex items-center gap-1 text-xs',
                  colors.icon
                )}
              >
                <ClipboardPaste className="w-3 h-3" />
                Token colado!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && !justPasted && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Spacer */}
          {!justPasted && !error && <div />}

          {/* Character counter */}
          {showCharCount && value.length > 0 && !success && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                'text-xs',
                value.length >= minLength
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-[var(--ds-text-muted)]'
              )}
            >
              {value.length}/{minLength}+
            </motion.span>
          )}
        </div>
      </div>
    );
  }
);
