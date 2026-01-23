'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Minimize2,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  isComplete: boolean;
  isOptional?: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface SetupChecklistProps {
  isWhatsAppConnected: boolean;
  isWebhookConfigured: boolean;
  hasSentFirstMessage: boolean;
  isPermanentTokenConfirmed: boolean;
  onConnectWhatsApp: () => void;
  onSendTestMessage: () => void;
  onConfigureWebhook: () => void;
  onCreatePermanentToken: () => void;
}

export function SetupChecklist({
  isWhatsAppConnected,
  isWebhookConfigured,
  hasSentFirstMessage,
  isPermanentTokenConfirmed,
  onConnectWhatsApp,
  onSendTestMessage,
  onConfigureWebhook,
  onCreatePermanentToken,
}: SetupChecklistProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Carregar estado de minimizado do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('smartzap_setup_checklist_minimized');
    if (stored === 'true') {
      setIsMinimized(true);
    }
  }, []);

  // Salvar estado de minimizado
  const handleMinimize = useCallback((minimized: boolean) => {
    setIsMinimized(minimized);
    localStorage.setItem('smartzap_setup_checklist_minimized', String(minimized));
  }, []);

  const items: ChecklistItem[] = [
    {
      id: 'whatsapp',
      label: 'Conectar WhatsApp',
      isComplete: isWhatsAppConnected,
      action: onConnectWhatsApp,
      actionLabel: 'Conectar',
    },
    {
      id: 'first-message',
      label: 'Enviar mensagem de teste',
      description: 'Valide que tudo funciona',
      isComplete: hasSentFirstMessage,
      action: onSendTestMessage,
      actionLabel: 'Enviar',
    },
    {
      id: 'webhook',
      label: 'Configurar webhook',
      description: 'Receba status de entrega',
      isComplete: isWebhookConfigured,
      action: onConfigureWebhook,
      actionLabel: 'Configurar',
    },
    {
      id: 'permanent-token',
      label: 'Token permanente',
      description: 'Evita interrupções',
      isComplete: isPermanentTokenConfirmed,
      isOptional: true,
      action: onCreatePermanentToken,
      actionLabel: 'Criar',
    },
  ];

  // Calcular progresso (não conta opcionais)
  const requiredItems = items.filter((item) => !item.isOptional);
  const completedRequired = requiredItems.filter((item) => item.isComplete).length;
  const progress = Math.round((completedRequired / requiredItems.length) * 100);

  // Se tudo completo (incluindo opcionais), não mostra nada
  const allComplete = items.every((item) => item.isComplete);

  if (allComplete || isDismissed) {
    return null;
  }

  // Versão minimizada - badge flutuante
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={() => handleMinimize(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-800 border border-zinc-700 shadow-xl hover:bg-zinc-700 hover:border-zinc-600 transition-all hover:scale-105"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-emerald-400">{progress}%</span>
          </div>
          <span className="text-sm font-medium text-zinc-300">Configuração</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white text-sm">Complete a configuração</h3>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
            {progress}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleMinimize(true)}
            className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title="Minimizar"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Items */}
      <div className="space-y-1">
        {items.map((item, index) => {
          // Separador antes dos opcionais
          const isFirstOptional = item.isOptional && !items[index - 1]?.isOptional;

          return (
            <div key={item.id}>
              {isFirstOptional && (
                <div className="text-[10px] uppercase tracking-wider text-zinc-600 mt-3 mb-2 px-1">
                  Opcional
                </div>
              )}
              <div
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg transition-colors',
                  item.isComplete
                    ? 'bg-transparent'
                    : 'bg-zinc-800/30 hover:bg-zinc-800/50'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-sm truncate',
                        item.isComplete ? 'text-zinc-500 line-through' : 'text-white'
                      )}
                    >
                      {item.label}
                    </p>
                    {item.description && !item.isComplete && (
                      <p className="text-[11px] text-zinc-500 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {!item.isComplete && item.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-7 px-2 text-xs flex-shrink-0"
                    onClick={item.action}
                  >
                    {item.actionLabel}
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
