'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { TokenInput } from '../TokenInput';
import { ValidatingOverlay } from '../ValidatingOverlay';
import { SuccessCheckmark } from '../SuccessCheckmark';
import { VALIDATION } from '@/lib/installer/types';
import type { FormProps } from './types';

/**
 * Form de credenciais Redis com comportamento MÁGICO.
 *
 * Fluxo especial (2 campos):
 * 1. Usuário cola REST URL
 * 2. Usuário cola REST Token
 * 3. Quando AMBOS válidos, aguarda 800ms
 * 4. Valida automaticamente via API
 * 5. Mostra checkmark e auto-avança (inicia provisioning)
 */
export function RedisForm({ data, onComplete, onBack, showBack }: FormProps) {
  const [restUrl, setRestUrl] = useState(data.redisRestUrl);
  const [restToken, setRestToken] = useState(data.redisRestToken);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoValidateTimer = useRef<NodeJS.Timeout | null>(null);

  const isValidUrl = restUrl.trim().startsWith('https://') && restUrl.trim().includes('.upstash.io');
  const isValidToken = restToken.trim().length >= VALIDATION.REDIS_TOKEN_MIN_LENGTH && /^[A-Za-z0-9_=-]+$/.test(restToken.trim());
  const canValidate = isValidUrl && isValidToken;

  const handleValidate = async () => {
    if (!canValidate) {
      setError('Preencha URL e Token válidos');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const res = await fetch('/api/installer/redis/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restUrl: restUrl.trim(),
          restToken: restToken.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || 'Credenciais inválidas');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao validar Redis');
    } finally {
      setValidating(false);
    }
  };

  const handleSuccessComplete = () => {
    onComplete({
      redisRestUrl: restUrl.trim(),
      redisRestToken: restToken.trim(),
    });
  };

  // Auto-validar quando ambos campos estiverem válidos
  useEffect(() => {
    if (autoValidateTimer.current) {
      clearTimeout(autoValidateTimer.current);
    }

    if (canValidate && !validating && !success && !error) {
      autoValidateTimer.current = setTimeout(() => {
        handleValidate();
      }, 800);
    }

    return () => {
      if (autoValidateTimer.current) {
        clearTimeout(autoValidateTimer.current);
      }
    };
  }, [restUrl, restToken, canValidate, validating, success, error]);

  // Estado de sucesso
  if (success) {
    return (
      <SuccessCheckmark
        message="Redis conectado! Iniciando instalação..."
        onComplete={handleSuccessComplete}
      />
    );
  }

  return (
    <div className="relative space-y-5">
      <ValidatingOverlay
        isVisible={validating}
        message="Verificando Redis..."
        subMessage="Testando conexão"
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-zinc-100">Configure cache de webhooks</h2>
        <p className="mt-1 text-sm text-zinc-400">Credenciais REST do Upstash Redis</p>
      </div>

      {/* REST URL */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">REST URL</label>
        <TokenInput
          value={restUrl}
          onChange={setRestUrl}
          placeholder="https://xxx-xxx.upstash.io"
          validating={false}
          success={isValidUrl && restUrl.length > 0}
          error={restUrl.length > 0 && !isValidUrl ? 'Formato: https://xxx.upstash.io' : undefined}
          minLength={20}
          showCharCount={false}
          accentColor="red"
          autoFocus
        />
      </div>

      {/* REST Token */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">REST Token</label>
        <TokenInput
          value={restToken}
          onChange={(val) => {
            setRestToken(val);
            setError(null); // Limpa erro ao digitar
          }}
          placeholder="AXxxxxxxxxxxxxxxxxxxxx"
          validating={false}
          success={isValidToken && restToken.length > 0}
          error={error || (restToken.length > 0 && !isValidToken ? 'Token deve ter 30+ caracteres alfanuméricos' : undefined)}
          minLength={VALIDATION.REDIS_TOKEN_MIN_LENGTH}
          showCharCount={false}
          accentColor="red"
        />
      </div>

      {/* Status de validação automática */}
      {canValidate && !validating && !success && !error && (
        <p className="text-xs text-red-400 text-center animate-pulse">
          Validando automaticamente...
        </p>
      )}

      {/* Collapsible help */}
      <details className="w-full group">
        <summary className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 cursor-pointer list-none transition-colors">
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
          Como criar um banco Redis?
        </summary>
        <div className="mt-3 p-3 rounded-lg bg-zinc-800/50 text-left space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside">
            <li>
              Acesse o{' '}
              <a href="https://console.upstash.com/redis" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">
                console Upstash Redis
              </a>
            </li>
            <li>
              Clique em <strong className="text-zinc-300">Create Database</strong>
            </li>
            <li>
              Nome: <strong className="text-zinc-300">smartzap</strong> • Região: <strong className="text-zinc-300">São Paulo</strong>
            </li>
            <li>
              Após criar, vá na aba <strong className="text-zinc-300">REST API</strong>
            </li>
            <li>Copie a URL e o Token</li>
          </ol>
        </div>
      </details>

    </div>
  );
}
