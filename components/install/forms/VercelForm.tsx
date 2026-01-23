'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TokenInput } from '../TokenInput';
import { ValidatingOverlay } from '../ValidatingOverlay';
import { SuccessCheckmark } from '../SuccessCheckmark';
import { VALIDATION } from '@/lib/installer/types';
import type { FormProps } from './types';

/**
 * Form de token Vercel com comportamento MÁGICO.
 *
 * Fluxo:
 * 1. Usuário cola o token
 * 2. Após 24+ chars, aguarda 800ms
 * 3. Valida automaticamente via API
 * 4. Mostra checkmark e auto-avança
 */
export function VercelForm({ data, onComplete, onBack, showBack }: FormProps) {
  const [token, setToken] = useState(data.vercelToken);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);

  const handleValidate = async () => {
    if (token.trim().length < VALIDATION.VERCEL_TOKEN_MIN_LENGTH) {
      setError('Token muito curto');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const res = await fetch('/api/installer/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          domain: window.location.hostname,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Token inválido');
      }

      setProjectName(result.project?.name || 'Projeto encontrado');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao validar token');
    } finally {
      setValidating(false);
    }
  };

  const handleSuccessComplete = () => {
    onComplete({ vercelToken: token.trim() });
  };

  // Estado de sucesso - mostra checkmark e auto-avança
  if (success) {
    return (
      <SuccessCheckmark
        message={projectName ? `Projeto "${projectName}" encontrado!` : 'Token validado!'}
        onComplete={handleSuccessComplete}
      />
    );
  }

  return (
    <div className="relative space-y-5">
      <ValidatingOverlay
        isVisible={validating}
        message="Verificando token..."
        subMessage="Procurando seu projeto na Vercel"
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19.5h20L12 2z" className="text-zinc-100" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-zinc-100">Conecte sua conta Vercel</h2>
        <p className="mt-1 text-sm text-zinc-400">Cole seu token de acesso</p>
      </div>

      {/* Token Input Mágico */}
      <TokenInput
        value={token}
        onChange={setToken}
        placeholder="Cole seu token aqui..."
        validating={validating}
        error={error || undefined}
        minLength={VALIDATION.VERCEL_TOKEN_MIN_LENGTH}
        autoSubmitLength={VALIDATION.VERCEL_TOKEN_MIN_LENGTH}
        onAutoSubmit={handleValidate}
        showCharCount={false}
        accentColor="blue"
        autoFocus
      />

      {/* Collapsible help */}
      <details className="w-full group">
        <summary className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 cursor-pointer list-none transition-colors">
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
          Como criar o token?
        </summary>
        <div className="mt-3 p-3 rounded-lg bg-zinc-800/50 text-left space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside">
            <li>
              Acesse{' '}
              <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                vercel.com/account/tokens
              </a>
            </li>
            <li>
              Clique em <strong className="text-zinc-300">Create</strong>
            </li>
            <li>
              Nome: <strong className="text-zinc-300">smartzap</strong> • Scope: <strong className="text-zinc-300">Full Account</strong>
            </li>
            <li>Copie e cole o token acima</li>
          </ol>
        </div>
      </details>

    </div>
  );
}
