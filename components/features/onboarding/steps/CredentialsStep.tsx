'use client';

import React from 'react';
import { ArrowRight, AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepHeader } from './StepHeader';

interface CredentialsStepProps {
  credentials: {
    phoneNumberId: string;
    businessAccountId: string;
    accessToken: string;
  };
  onCredentialsChange: (credentials: {
    phoneNumberId: string;
    businessAccountId: string;
    accessToken: string;
  }) => void;
  onNext: () => void;
  onBack: () => void;
  stepNumber: number;
  totalSteps: number;
}

// Validação de formato dos IDs da Meta (geralmente 15-20 dígitos numéricos)
function isValidMetaId(value: string): boolean {
  const trimmed = value.trim();
  // Deve ser apenas números e ter entre 10-25 dígitos
  return /^\d{10,25}$/.test(trimmed);
}

// Validação básica do formato do token Meta (começa com EAA)
function isValidTokenFormat(value: string): boolean {
  const trimmed = value.trim();
  // Tokens Meta começam com EAA e têm pelo menos 50 caracteres
  return trimmed.startsWith('EAA') && trimmed.length >= 50;
}

export function CredentialsStep({
  credentials,
  onCredentialsChange,
  onNext,
  onBack,
  stepNumber,
  totalSteps,
}: CredentialsStepProps) {
  const phoneId = credentials.phoneNumberId.trim();
  const wabaId = credentials.businessAccountId.trim();
  const token = credentials.accessToken.trim();

  // Validações de formato
  const phoneIdValid = isValidMetaId(phoneId);
  const wabaIdValid = isValidMetaId(wabaId);
  const tokenValid = isValidTokenFormat(token);

  // IDs não podem ser iguais - são campos diferentes
  const idsAreEqual = phoneId && wabaId && phoneId === wabaId;

  // Todos os campos preenchidos e com formato válido
  const isValid = phoneIdValid && wabaIdValid && tokenValid && !idsAreEqual;

  return (
    <div className="space-y-6">
      <StepHeader
        stepNumber={stepNumber}
        totalSteps={totalSteps}
        title="Copiar Credenciais"
        onBack={onBack}
      />

      <p className="text-sm text-zinc-400">
        Na página <strong className="text-white">"API Setup"</strong> do seu app, copie os seguintes dados:
      </p>

      {/* Campos */}
      <div className="space-y-4">
        {/* Phone Number ID */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumberId" className="flex items-center gap-2">
            Phone Number ID
            <span className="text-red-400">*</span>
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
          </Label>
          <Input
            id="phoneNumberId"
            placeholder="123456789012345"
            value={credentials.phoneNumberId}
            onChange={(e) =>
              onCredentialsChange({ ...credentials, phoneNumberId: e.target.value })
            }
            className={`font-mono ${phoneId && !phoneIdValid ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {phoneId && !phoneIdValid ? (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Formato inválido. Deve conter apenas números (15-20 dígitos).
            </p>
          ) : (
            <p className="text-xs text-zinc-500">Parece com: 123456789012345</p>
          )}
        </div>

        {/* Business Account ID */}
        <div className="space-y-2">
          <Label htmlFor="businessAccountId" className="flex items-center gap-2">
            WhatsApp Business Account ID
            <span className="text-red-400">*</span>
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
          </Label>
          <Input
            id="businessAccountId"
            placeholder="987654321098765"
            value={credentials.businessAccountId}
            onChange={(e) =>
              onCredentialsChange({ ...credentials, businessAccountId: e.target.value })
            }
            className={`font-mono ${(wabaId && !wabaIdValid) || idsAreEqual ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {idsAreEqual ? (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              WABA ID deve ser diferente do Phone Number ID. São campos distintos.
            </p>
          ) : wabaId && !wabaIdValid ? (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Formato inválido. Deve conter apenas números (15-20 dígitos).
            </p>
          ) : (
            <p className="text-xs text-zinc-500">Também conhecido como WABA ID (diferente do Phone ID)</p>
          )}
        </div>

        {/* Access Token */}
        <div className="space-y-2">
          <Label htmlFor="accessToken" className="flex items-center gap-2">
            Access Token
            <span className="text-red-400">*</span>
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
          </Label>
          <Input
            id="accessToken"
            type="password"
            placeholder="EAAG..."
            value={credentials.accessToken}
            onChange={(e) =>
              onCredentialsChange({ ...credentials, accessToken: e.target.value })
            }
            className={`font-mono ${token && !tokenValid ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {token && !tokenValid ? (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Formato inválido. Token Meta deve começar com "EAA" e ter pelo menos 50 caracteres.
            </p>
          ) : (
            <p className="text-xs text-zinc-500">
              Clique em "Generate" se não tiver um token
            </p>
          )}
        </div>
      </div>

      {/* Aviso sobre token temporário */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-200/80">
            Este token expira em <strong>24 horas</strong>. Depois de testar, vamos te mostrar como criar um token permanente.
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={!isValid}>
          Próximo
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
