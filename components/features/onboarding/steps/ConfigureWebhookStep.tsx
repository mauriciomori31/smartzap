'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepHeader } from './StepHeader';
import { toast } from 'sonner';

interface ConfigureWebhookStepProps {
  onNext: () => void;
  onBack: () => void;
  stepNumber: number;
  totalSteps: number;
  onWebhookValidated?: () => void;
}

interface WebhookInfo {
  webhookUrl: string;
  webhookToken: string;
}

type ValidationStatus = 'idle' | 'loading' | 'success' | 'error';

export function ConfigureWebhookStep({
  onNext,
  onBack,
  stepNumber,
  totalSteps,
  onWebhookValidated,
}: ConfigureWebhookStepProps) {
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);

  // Buscar dados do webhook
  useEffect(() => {
    async function fetchWebhookInfo() {
      try {
        const response = await fetch('/api/webhook/info');
        if (!response.ok) throw new Error('Falha ao carregar dados do webhook');
        const data = await response.json();
        setWebhookInfo({
          webhookUrl: data.webhookUrl,
          webhookToken: data.webhookToken,
        });
      } catch (error) {
        toast.error('Erro ao carregar dados do webhook');
      } finally {
        setIsLoading(false);
      }
    }
    fetchWebhookInfo();
  }, []);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copiado!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Falha ao copiar');
    }
  };

  const handleValidateWebhook = async () => {
    setValidationStatus('loading');
    try {
      const response = await fetch('/api/webhook/validate');
      const data = await response.json();

      if (data.isValid) {
        setValidationStatus('success');
        setLastEventAt(data.lastEventAt || null);
        toast.success('Webhook configurado corretamente!', {
          description: data.lastEventAt
            ? `Último evento: ${new Date(data.lastEventAt).toLocaleString('pt-BR')}`
            : 'Conexão verificada com sucesso',
        });
        // Notificar que o webhook foi validado
        onWebhookValidated?.();
      } else {
        setValidationStatus('error');
        toast.error('Webhook não está recebendo eventos', {
          description: data.message || 'Verifique se configurou corretamente no Meta',
        });
      }
    } catch (error) {
      setValidationStatus('error');
      toast.error('Erro ao validar webhook');
    }
  };

  const META_APP_SETTINGS_URL = 'https://developers.facebook.com/apps/';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StepHeader
        stepNumber={stepNumber}
        totalSteps={totalSteps}
        title="Configurar Webhook"
        onBack={onBack}
      />

      {/* Dados do Webhook */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
        <h4 className="font-medium text-emerald-200 flex items-center gap-2">
          <span className="text-lg">🔗</span>
          Dados do seu Webhook
        </h4>

        {/* URL */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wide">URL do Webhook</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-zinc-800 rounded-lg font-mono text-sm text-white truncate">
              {webhookInfo?.webhookUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(webhookInfo?.webhookUrl || '', 'url')}
              className="flex-shrink-0"
            >
              {copiedField === 'url' ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Token */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wide">Token de Verificação</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-zinc-800 rounded-lg font-mono text-sm text-white truncate">
              {webhookInfo?.webhookToken}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(webhookInfo?.webhookToken || '', 'token')}
              className="flex-shrink-0"
            >
              {copiedField === 'token' ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-300">Configure no seu App Meta:</h4>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
          <div className="text-zinc-300">
            <p>Acesse seu app no <strong className="text-white">Meta for Developers</strong></p>
            <p className="text-zinc-500 text-sm">Vá em WhatsApp → Configuração</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
          <div className="text-zinc-300">
            <p>Na seção <strong className="text-white">"Webhook"</strong>, clique em <strong className="text-white">"Editar"</strong></p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
          <div className="text-zinc-300">
            <p>Cole a <strong className="text-white">URL do Callback</strong> (copiada acima)</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
          <div className="text-zinc-300">
            <p>Cole o <strong className="text-white">Token de Verificação</strong> (copiado acima)</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">5</span>
          <div className="text-zinc-300">
            <p>Clique em <strong className="text-white">"Verificar e salvar"</strong></p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm font-medium flex-shrink-0">!</span>
          <div className="text-amber-200/80">
            <p className="font-medium text-amber-200">Após salvar, atualize a página (F5)</p>
            <p className="text-sm">A opção de inscrição nos campos do webhook só aparece após recarregar</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">6</span>
          <div className="text-zinc-300">
            <p>Clique em <strong className="text-white">"Gerenciar"</strong> e marque <strong className="text-white">"messages"</strong></p>
            <p className="text-zinc-500 text-sm">Isso permite receber notificações de mensagens</p>
          </div>
        </div>
      </div>

      {/* Botão para abrir Meta */}
      <a
        href={META_APP_SETTINGS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Abrir Meta for Developers
      </a>

      {/* Aviso importante */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-200 mb-1">Importante!</p>
            <p className="text-sm text-amber-200/80">
              Sem o webhook configurado, você <strong>não receberá</strong> confirmações de entrega e leitura das mensagens.
            </p>
          </div>
        </div>
      </div>

      {/* Validação */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-zinc-300 font-medium">Status do Webhook</span>
          <div className="flex items-center gap-2">
            {validationStatus === 'idle' && (
              <span className="text-zinc-500 text-sm">Aguardando validação</span>
            )}
            {validationStatus === 'loading' && (
              <span className="text-zinc-400 text-sm flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Verificando...
              </span>
            )}
            {validationStatus === 'success' && (
              <span className="text-emerald-400 text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Configurado corretamente
              </span>
            )}
            {validationStatus === 'error' && (
              <span className="text-red-400 text-sm">Não configurado</span>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleValidateWebhook}
          disabled={validationStatus === 'loading'}
        >
          {validationStatus === 'loading' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {validationStatus === 'success' ? 'Verificar novamente' : 'Verificar Webhook'}
        </Button>

        {lastEventAt && (
          <p className="text-xs text-zinc-500 text-center">
            Último evento recebido: {new Date(lastEventAt).toLocaleString('pt-BR')}
          </p>
        )}
      </div>

      {/* Ações */}
      <div className="flex justify-end pt-2">
        <Button onClick={onNext}>
          {validationStatus === 'success' ? (
            <>
              Concluir Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {validationStatus !== 'success' && (
        <p className="text-xs text-zinc-500 text-center">
          Você pode configurar o webhook depois em Configurações → Webhook
        </p>
      )}
    </div>
  );
}
