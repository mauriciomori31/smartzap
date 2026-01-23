'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TokenInput } from '../TokenInput';
import { ValidatingOverlay } from '../ValidatingOverlay';
import { SuccessCheckmark } from '../SuccessCheckmark';
import { VALIDATION } from '@/lib/installer/types';
import type { FormProps } from './types';

/**
 * Form de PAT Supabase com comportamento MÁGICO.
 *
 * Fluxo:
 * 1. Usuário cola o PAT (sbp_...)
 * 2. Após 40+ chars com prefixo correto, aguarda 800ms
 * 3. Valida automaticamente via API (lista organizações)
 * 4. Mostra checkmark e auto-avança
 */
export function SupabaseForm({ data, onComplete, onBack, showBack }: FormProps) {
  const [pat, setPat] = useState(data.supabasePat);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);

  const isValidFormat = pat.trim().startsWith(VALIDATION.SUPABASE_PAT_PREFIX) &&
                        pat.trim().length >= VALIDATION.SUPABASE_PAT_MIN_LENGTH;

  const handleValidate = async () => {
    if (!isValidFormat) {
      setError(`Token deve começar com ${VALIDATION.SUPABASE_PAT_PREFIX}`);
      return;
    }

    setValidating(true);
    setError(null);

    try {
      // Valida listando organizações
      const res = await fetch('/api/installer/supabase/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: pat.trim() }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || 'PAT inválido');
      }

      // Pega nome da primeira org
      const firstOrg = result.organizations?.[0];
      setOrgName(firstOrg?.name || 'Conta conectada');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao validar PAT');
    } finally {
      setValidating(false);
    }
  };

  const handleSuccessComplete = () => {
    onComplete({ supabasePat: pat.trim() });
  };

  // Só auto-submit se formato válido
  const handleAutoSubmit = () => {
    if (isValidFormat) {
      handleValidate();
    }
  };

  // Estado de sucesso
  if (success) {
    return (
      <SuccessCheckmark
        message={orgName ? `Organização "${orgName}" encontrada!` : 'PAT validado!'}
        onComplete={handleSuccessComplete}
      />
    );
  }

  return (
    <div className="relative space-y-5">
      <ValidatingOverlay
        isVisible={validating}
        message="Verificando PAT..."
        subMessage="Conectando ao Supabase"
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.362 9.354H12V.396a.396.396 0 00-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 00.836 1.659H12v8.959a.396.396 0 00.716.233l9.081-12.261.401-.562a1.04 1.04 0 00-.836-1.66z" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-zinc-100">Conecte o Supabase</h2>
        <p className="mt-1 text-sm text-zinc-400">Personal Access Token (PAT)</p>
      </div>

      {/* Token Input Mágico */}
      <TokenInput
        value={pat}
        onChange={setPat}
        placeholder="sbp_..."
        validating={validating}
        error={error || undefined}
        minLength={VALIDATION.SUPABASE_PAT_MIN_LENGTH}
        autoSubmitLength={VALIDATION.SUPABASE_PAT_MIN_LENGTH}
        onAutoSubmit={handleAutoSubmit}
        showCharCount={false}
        accentColor="emerald"
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
              <a
                href="https://supabase.com/dashboard/account/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                supabase.com/dashboard/account/tokens
              </a>
            </li>
            <li>
              Clique em <strong className="text-zinc-300">Generate new token</strong>
            </li>
            <li>
              Nome: <strong className="text-zinc-300">smartzap</strong>
            </li>
            <li>Copie o token (começa com sbp_)</li>
          </ol>
          <p className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-700">
            O projeto Supabase será criado automaticamente durante a instalação.
          </p>
        </div>
      </details>

    </div>
  );
}
