'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Credentials {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
}

interface CredentialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onHelpClick: () => void;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export function CredentialsModal({
  open,
  onOpenChange,
  onSuccess,
  onHelpClick,
}: CredentialsModalProps) {
  const [credentials, setCredentials] = useState<Credentials>({
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
  });
  const [showToken, setShowToken] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isFormValid =
    credentials.phoneNumberId.trim() &&
    credentials.businessAccountId.trim() &&
    credentials.accessToken.trim();

  const handleTest = async () => {
    if (!isFormValid) return;

    setTestStatus('testing');
    setErrorMessage('');

    try {
      // API /api/settings/credentials faz teste + save em uma única chamada
      const res = await fetch('/api/settings/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Credenciais inválidas');
      }

      // Sincronizar templates automaticamente (fire-and-forget)
      fetch('/api/templates/sync', { method: 'POST' }).catch(() => {
        // Ignora erro - não é crítico
      });

      setTestStatus('success');

      // Fechar modal após breve delay para mostrar sucesso
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
        // Reset state
        setTestStatus('idle');
        setCredentials({ phoneNumberId: '', businessAccountId: '', accessToken: '' });
      }, 1000);
    } catch (error) {
      setTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleClose = () => {
    if (testStatus === 'testing') return; // Não fecha durante teste
    onOpenChange(false);
    setTestStatus('idle');
    setErrorMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription className="text-center">
            Cole suas credenciais do Meta Business Suite
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Phone Number ID */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumberId">Phone Number ID</Label>
            <Input
              id="phoneNumberId"
              placeholder="Ex: 123456789012345"
              value={credentials.phoneNumberId}
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, phoneNumberId: e.target.value }))
              }
              disabled={testStatus === 'testing'}
            />
          </div>

          {/* Business Account ID */}
          <div className="space-y-2">
            <Label htmlFor="businessAccountId">Business Account ID</Label>
            <Input
              id="businessAccountId"
              placeholder="Ex: 123456789012345"
              value={credentials.businessAccountId}
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, businessAccountId: e.target.value }))
              }
              disabled={testStatus === 'testing'}
            />
          </div>

          {/* Access Token */}
          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <div className="relative">
              <Input
                id="accessToken"
                type={showToken ? 'text' : 'password'}
                placeholder="Cole seu token de acesso"
                value={credentials.accessToken}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, accessToken: e.target.value }))
                }
                disabled={testStatus === 'testing'}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                tabIndex={-1}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Help Link */}
          <button
            type="button"
            onClick={onHelpClick}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors w-full justify-center py-2"
          >
            <HelpCircle className="w-4 h-4" />
            Não sabe onde encontrar? Ver tutorial passo-a-passo
          </button>

          {/* Error Message */}
          {testStatus === 'error' && errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{errorMessage}</p>
            </div>
          )}

          {/* Success Message */}
          {testStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-sm text-emerald-200">
                Conectado! Sincronizando templates...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={testStatus === 'testing'}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleTest}
              disabled={!isFormValid || testStatus === 'testing' || testStatus === 'success'}
              className="min-w-[140px]"
            >
              {testStatus === 'testing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : testStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Conectado!
                </>
              ) : (
                'Testar e Conectar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
