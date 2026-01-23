'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, AlertTriangle } from 'lucide-react';
import { StepCard } from './StepCard';
import { Button } from '@/components/ui/button';
import type { InstallData, ProvisionStreamEvent, ProvisionPayload } from '@/lib/installer/types';

interface ProvisioningViewProps {
  data: InstallData;
  progress: number;
  title: string;
  subtitle: string;
  onProgress: (event: ProvisionStreamEvent) => void;
  onReset?: () => void;
}

/**
 * View de provisionamento com streaming SSE.
 *
 * Responsável por:
 * 1. Chamar a API de provisioning
 * 2. Parsear eventos SSE
 * 3. Reportar progresso para o parent
 * 4. Detectar rehydration e oferecer reset (Critical #2)
 */
export function ProvisioningView({ data, progress, title, subtitle, onProgress, onReset }: ProvisioningViewProps) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasStartedRef = useRef(false);

  // Critical #2: Detectar rehydration (progress > 0 mas stream não ativo)
  const [isRehydrated, setIsRehydrated] = useState(() => progress > 0 && progress < 100);

  const startProvisioning = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    abortControllerRef.current = new AbortController();

    const payload: ProvisionPayload = {
      identity: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      vercel: {
        token: data.vercelToken,
      },
      supabase: {
        pat: data.supabasePat,
      },
      qstash: {
        token: data.qstashToken,
      },
      redis: {
        restUrl: data.redisRestUrl,
        restToken: data.redisRestToken,
      },
    };

    try {
      const response = await fetch('/api/installer/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      // Parse SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream não disponível');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: ProvisionStreamEvent = JSON.parse(line.slice(6));
              onProgress(event);
            } catch (parseErr) {
              // Medium #5: Não silenciar erros de parse, logar para debug
              console.warn('[Provisioning] Erro ao parsear evento SSE:', {
                line: line.slice(0, 100),
                error: parseErr instanceof Error ? parseErr.message : 'Erro desconhecido',
              });
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;

      onProgress({
        type: 'error',
        error: err instanceof Error ? err.message : 'Erro desconhecido',
        returnToStep: 1,
      });
    }
  }, [data, onProgress]);

  useEffect(() => {
    // Critical #2: Não iniciar se estiver em estado de rehydration
    if (isRehydrated) return;

    startProvisioning();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [startProvisioning, isRehydrated]);

  // Critical #2: Se detectou rehydration, mostrar aviso
  if (isRehydrated) {
    return (
      <StepCard glowColor="orange">
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>

          <h2 className="mt-6 text-xl font-semibold text-zinc-100">Instalação Interrompida</h2>

          <p className="mt-2 text-sm text-zinc-400 max-w-sm">
            Parece que a instalação foi interrompida antes de terminar.
            Para garantir que tudo funcione corretamente, recomendamos recomeçar.
          </p>

          <div className="flex gap-3 mt-8 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsRehydrated(false);
                hasStartedRef.current = false;
              }}
            >
              Continuar mesmo assim
            </Button>
            {onReset && (
              <Button variant="brand" className="flex-1" onClick={onReset}>
                Recomeçar instalação
              </Button>
            )}
          </div>
        </div>
      </StepCard>
    );
  }

  return (
    <StepCard glowColor="emerald">
      <div className="flex flex-col items-center text-center py-8">
        {/* Animated icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-500"
          />
          <div className="w-16 h-16 flex items-center justify-center">
            <Terminal className="w-8 h-8 text-emerald-500" />
          </div>
        </motion.div>

        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 text-xl font-semibold text-zinc-100"
          >
            {title}
          </motion.h2>
        </AnimatePresence>

        {/* Subtitle */}
        <AnimatePresence mode="wait">
          <motion.p
            key={subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm text-zinc-400 h-5"
          >
            {subtitle}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full mt-8">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-zinc-500">Não feche esta página</p>
      </div>
    </StepCard>
  );
}
