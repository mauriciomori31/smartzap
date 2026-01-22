'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  ExternalLink,
  Key,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepHeader } from './StepHeader';
import { toast } from 'sonner';

interface CreatePermanentTokenStepProps {
  currentToken: string;
  onTokenUpdate: (token: string) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  stepNumber: number;
  totalSteps: number;
}

export function CreatePermanentTokenStep({
  currentToken,
  onTokenUpdate,
  onNext,
  onBack,
  onSkip,
  stepNumber,
  totalSteps,
}: CreatePermanentTokenStepProps) {
  const [permanentToken, setPermanentToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedPermission, setCopiedPermission] = useState<string | null>(null);

  const META_BUSINESS_SETTINGS_URL = 'https://business.facebook.com/settings/system-users';

  const permissions = [
    { name: 'business_management', description: 'Gerenciar configurações do negócio' },
    { name: 'whatsapp_business_messaging', description: 'Enviar mensagens pelo WhatsApp' },
    { name: 'whatsapp_business_management', description: 'Gerenciar conta WhatsApp Business' },
  ];

  const handleCopyPermission = async (permission: string) => {
    try {
      await navigator.clipboard.writeText(permission);
      setCopiedPermission(permission);
      toast.success('Copiado!');
      setTimeout(() => setCopiedPermission(null), 2000);
    } catch {
      toast.error('Falha ao copiar');
    }
  };

  const handleSaveToken = async () => {
    if (!permanentToken.trim()) {
      toast.error('Digite o token permanente');
      return;
    }

    // Validação básica - tokens do Meta começam com EAAG
    if (!permanentToken.startsWith('EAAG')) {
      toast.error('Token inválido', {
        description: 'O token deve começar com "EAAG"',
      });
      return;
    }

    setIsSaving(true);
    try {
      await onTokenUpdate(permanentToken);
      toast.success('Token permanente salvo!', {
        description: 'Seu token não expira mais automaticamente',
      });
      onNext();
    } catch (error: any) {
      toast.error('Erro ao salvar token', {
        description: error?.message || 'Tente novamente',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <StepHeader
        stepNumber={stepNumber}
        totalSteps={totalSteps}
        title="Criar Token Permanente"
        onBack={onBack}
      />

      {/* Explicação */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Key className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-200 mb-1">Por que criar um token permanente?</p>
            <p className="text-sm text-blue-200/80">
              O token temporário expira em ~24 horas. Para evitar interrupções no serviço,
              crie um <strong>System User</strong> no Meta Business e gere um token que não expira.
            </p>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          Siga os passos no Meta Business:
        </h4>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
          <div className="text-zinc-300">
            <p>Acesse <strong className="text-white">Configurações do negócio</strong> → <strong className="text-white">Usuários do sistema</strong></p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
          <div className="text-zinc-300">
            <p>Clique em <strong className="text-white">"Adicionar"</strong> para criar um novo usuário do sistema</p>
            <p className="text-zinc-500 text-sm">Nome sugerido: "SmartZap API" - Função: Admin</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
          <div className="text-zinc-300">
            <p>Selecione o usuário criado e clique em <strong className="text-white">"Atribuir ativos"</strong></p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
          <div className="text-zinc-300">
            <p>Atribua seu <strong className="text-white">App</strong> com permissão <strong className="text-white">"Gerenciar aplicativo"</strong></p>
            <p className="text-zinc-500 text-sm">Em "Controle total", ative "Gerenciar aplicativo"</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">5</span>
          <div className="text-zinc-300">
            <p>Atribua sua <strong className="text-white">Conta WhatsApp Business</strong></p>
            <p className="text-zinc-500 text-sm">Em "Controle total", ative "Gerenciar conta do WhatsApp Business"</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">6</span>
          <div className="text-zinc-300">
            <p>Clique em <strong className="text-white">"Gerar token"</strong></p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">7</span>
          <div className="text-zinc-300">
            <p>Adicione as <strong className="text-white">permissões obrigatórias</strong>:</p>
          </div>
        </div>
      </div>

      {/* Permissões */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 space-y-2">
        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-3">Permissões necessárias:</p>
        {permissions.map((perm) => (
          <div key={perm.name} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50">
            <div>
              <code className="text-sm text-emerald-400 font-mono">{perm.name}</code>
              <p className="text-xs text-zinc-500">{perm.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyPermission(perm.name)}
              className="flex-shrink-0"
            >
              {copiedPermission === perm.name ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Botão para abrir Meta Business */}
      <a
        href={META_BUSINESS_SETTINGS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Abrir Configurações do Negócio
      </a>

      {/* Input do token */}
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
        <Label className="text-zinc-300 flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-500" />
          Cole seu Token Permanente
        </Label>
        <Input
          type="password"
          placeholder="EAAG..."
          value={permanentToken}
          onChange={(e) => setPermanentToken(e.target.value)}
          className="font-mono"
        />
        <p className="text-xs text-zinc-500">
          O token começa com "EAAG" e tem centenas de caracteres
        </p>
      </div>

      {/* Aviso de segurança */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-200 mb-1">Guarde seu token com segurança!</p>
            <p className="text-sm text-amber-200/80">
              O token só é exibido uma vez. Copie e guarde em local seguro antes de sair da página do Meta.
            </p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-2">
        {onSkip && (
          <Button variant="outline" onClick={onSkip} className="flex-1">
            Pular por agora
          </Button>
        )}
        <Button
          onClick={handleSaveToken}
          disabled={!permanentToken.trim() || isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Salvar Token Permanente
            </>
          )}
        </Button>
      </div>

      {onSkip && (
        <p className="text-xs text-zinc-500 text-center">
          Você pode criar o token permanente depois em Configurações → WhatsApp
        </p>
      )}
    </div>
  );
}
