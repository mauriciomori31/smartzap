'use client';

import React from 'react';
import { ArrowRight, ExternalLink, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepHeader } from './StepHeader';

interface CreateAppStepProps {
  onNext: () => void;
  onBack: () => void;
  stepNumber: number;
  totalSteps: number;
}

export function CreateAppStep({ onNext, onBack, stepNumber, totalSteps }: CreateAppStepProps) {
  const META_DEVELOPERS_URL = 'https://developers.facebook.com/apps/';

  return (
    <div className="space-y-6">
      <StepHeader
        stepNumber={stepNumber}
        totalSteps={totalSteps}
        title="Criar App no Meta"
        onBack={onBack}
      />

      {/* Instruções */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
          <p className="text-zinc-300">Clique no botão abaixo para abrir o portal Meta</p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
          <p className="text-zinc-300">Faça login com sua conta Facebook</p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
          <p className="text-zinc-300">
            Clique em <strong className="text-white">"Criar App"</strong>
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
          <div className="text-zinc-300">
            <p>Em "Casos de uso", selecione <strong className="text-white">"Outro"</strong></p>
            <p className="text-zinc-500 text-sm mt-1">(aparece como "Outro - Esta opção vai desaparecer em breve")</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">5</span>
          <div className="text-zinc-300">
            <p>Na próxima tela, escolha o tipo <strong className="text-white">"Empresa"</strong></p>
            <p className="text-zinc-500 text-sm mt-1">Isso habilitará o produto WhatsApp Business</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">6</span>
          <div className="text-zinc-300">
            <p>Dê um nome (ex: <strong className="text-white">"Minha Empresa WhatsApp"</strong>) e informe seu email</p>
            <p className="text-zinc-500 text-sm mt-1">
              💡 O campo "Portfólio empresarial" é opcional — será criado automaticamente se você não tiver um
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-medium flex-shrink-0">7</span>
          <p className="text-zinc-300">
            Clique em <strong className="text-white">"Criar app"</strong> para finalizar
          </p>
        </div>
      </div>

      {/* Botão para abrir Meta */}
      <a
        href={META_DEVELOPERS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Abrir Meta for Developers
      </a>

      {/* Dica */}
      <div className="flex items-start gap-2 text-sm text-zinc-400">
        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p>Mantenha esta aba aberta para voltar depois</p>
      </div>

      {/* Ações */}
      <div className="flex justify-end pt-2">
        <Button onClick={onNext}>
          Criei o app
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
