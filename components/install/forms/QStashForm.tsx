'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TokenInput } from '../TokenInput';
import { ValidatingOverlay } from '../ValidatingOverlay';
import { SuccessCheckmark } from '../SuccessCheckmark';
import { VALIDATION } from '@/lib/installer/types';
import type { FormProps } from './types';

/**
 * Form de token QStash com comportamento MÁGICO.
 *
 * Fluxo:
 * 1. Usuário cola o token (eyJ... ou qstash_...)
 * 2. Após 30+ chars com formato válido, aguarda 800ms
 * 3. Valida automaticamente via API
 * 4. Mostra checkmark e auto-avança
 */
export function QStashForm({ data, onComplete, onBack, showBack }: FormProps) {
  const [token, setToken] = useState(data.qstashToken);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QStash token: JWT (eyJ...) ou qstash_
  const isValidFormat =
    token.trim().startsWith('eyJ') ||
    token.trim().startsWith('qstash_') ||
    token.trim().split('.').length === 3;

  const canValidate = isValidFormat && token.trim().length >= VALIDATION.QSTASH_TOKEN_MIN_LENGTH;

  const handleValidate = async () => {
    if (!canValidate) {
      setError('Token deve começar com eyJ ou qstash_');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const res = await fetch('/api/installer/qstash/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || 'Token inválido');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao validar token');
    } finally {
      setValidating(false);
    }
  };

  const handleSuccessComplete = () => {
    onComplete({ qstashToken: token.trim() });
  };

  // Só auto-submit se formato válido
  const handleAutoSubmit = () => {
    if (canValidate) {
      handleValidate();
    }
  };

  // Estado de sucesso
  if (success) {
    return (
      <SuccessCheckmark
        message="QStash conectado!"
        onComplete={handleSuccessComplete}
      />
    );
  }

  return (
    <div className="relative space-y-5">
      <ValidatingOverlay
        isVisible={validating}
        message="Verificando token..."
        subMessage="Conectando ao QStash"
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
          <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-zinc-100">Configure filas de mensagens</h2>
        <p className="mt-1 text-sm text-zinc-400">Token do Upstash QStash</p>
      </div>

      {/* Token Input Mágico */}
      <TokenInput
        value={token}
        onChange={setToken}
        placeholder="eyJVc2VySUQi... ou qstash_..."
        validating={validating}
        error={error || undefined}
        minLength={VALIDATION.QSTASH_TOKEN_MIN_LENGTH}
        autoSubmitLength={VALIDATION.QSTASH_TOKEN_MIN_LENGTH}
        onAutoSubmit={handleAutoSubmit}
        showCharCount={false}
        accentColor="orange"
        autoFocus
      />

      {/* Collapsible help */}
      <details className="w-full group">
        <summary className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 cursor-pointer list-none transition-colors">
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
          Como obter o token?
        </summary>
        <div className="mt-3 p-3 rounded-lg bg-zinc-800/50 text-left space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside">
            <li>
              Crie uma conta gratuita no{' '}
              <a href="https://console.upstash.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                Upstash
              </a>
            </li>
            <li>
              Clique em <strong className="text-zinc-300">QStash</strong> no menu lateral
            </li>
            <li>
              Copie o <strong className="text-zinc-300">QSTASH_TOKEN</strong> na aba Details
            </li>
          </ol>
        </div>
      </details>

    </div>
  );
}
