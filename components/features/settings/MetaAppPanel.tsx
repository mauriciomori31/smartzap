'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, ExternalLink, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { settingsService } from '@/services/settingsService';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';

export interface MetaAppPanelProps {
  metaApp?: {
    appId: string | null;
    hasAppSecret: boolean;
    isConfigured: boolean;
  } | null;
  metaAppLoading?: boolean;
  refreshMetaApp?: () => void;
}

export function MetaAppPanel({
  metaApp,
  metaAppLoading,
  refreshMetaApp,
}: MetaAppPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [appIdDraft, setAppIdDraft] = useState('');
  const [appSecretDraft, setAppSecretDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = () => {
    setIsEditing(true);
    setAppIdDraft(metaApp?.appId || '');
    setAppSecretDraft('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAppSecretDraft('');
  };

  const handleSave = async () => {
    try {
      if (!appIdDraft.trim() || !appSecretDraft.trim()) {
        toast.error('App ID e App Secret são obrigatórios');
        return;
      }

      setIsSaving(true);
      await settingsService.saveMetaAppConfig({
        appId: appIdDraft.trim(),
        appSecret: appSecretDraft.trim(),
      });

      toast.success('Meta App salvo com sucesso');
      setIsEditing(false);
      setAppSecretDraft('');
      refreshMetaApp?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsSaving(true);
      await settingsService.removeMetaAppConfig();
      toast.success('Meta App removido (DB)');
      refreshMetaApp?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha ao remover');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="test-contact" className="glass-panel rounded-2xl p-8">
      <SectionHeader
        title="Meta App (opcional)"
        description={
          <>
            Habilita validação forte do token via <span className="font-mono">/debug_token</span> no Diagnóstico da Meta
            (expiração, escopos, app_id e granular_scopes).
            O <b>App Secret</b> fica no servidor (Supabase) e <b>nunca</b> é exibido no frontend.
          </>
        }
        color="info"
        icon={LinkIcon}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshMetaApp?.()}
              className="h-10 px-4 rounded-lg bg-[var(--ds-bg-hover)] text-[var(--ds-text-primary)] hover:bg-[var(--ds-bg-surface)] border border-[var(--ds-border-default)] hover:border-[var(--ds-border-strong)] transition-all text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw size={14} /> Atualizar
            </button>
            <Link
              href="/settings/meta-diagnostics"
              className="h-10 px-4 rounded-lg bg-[var(--ds-bg-hover)] text-[var(--ds-text-primary)] hover:bg-[var(--ds-bg-surface)] border border-[var(--ds-border-default)] hover:border-[var(--ds-border-strong)] transition-all text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap"
            >
              <ExternalLink size={14} /> Abrir diagnóstico
            </Link>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--ds-border-default)] bg-[var(--ds-bg-elevated)] p-4">
          <div className="text-xs text-[var(--ds-text-secondary)]">Status</div>
          <div className="mt-2">
            {metaAppLoading ? (
              <span className="text-sm text-[var(--ds-text-secondary)]">Carregando…</span>
            ) : metaApp?.isConfigured ? (
              <StatusBadge status="success">Configurado</StatusBadge>
            ) : (
              <StatusBadge status="default">Não configurado</StatusBadge>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--ds-border-default)] bg-[var(--ds-bg-elevated)] p-4">
          <div className="text-xs text-[var(--ds-text-secondary)]">App ID</div>
          <div className="mt-1 text-sm text-[var(--ds-text-primary)] font-mono">
            {metaAppLoading ? '—' : metaApp?.appId || '—'}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--ds-border-default)] bg-[var(--ds-bg-elevated)] p-4">
          <div className="text-xs text-[var(--ds-text-secondary)]">Fonte</div>
          <div className="mt-1 text-sm text-[var(--ds-text-primary)]">
            {metaAppLoading ? '—' : metaApp?.isConfigured ? 'Banco (Supabase)' : '—'}
          </div>
        </div>
      </div>

      <div className="mt-6">
        {!isEditing ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleStartEdit}
              className="h-10 px-4 rounded-xl bg-[var(--ds-bg-hover)] text-[var(--ds-text-primary)] hover:bg-[var(--ds-bg-surface)] border border-[var(--ds-border-default)] hover:border-[var(--ds-border-strong)] transition-all text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Edit2 size={14} /> Configurar App ID/Secret
            </button>

            {metaApp?.isConfigured && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isSaving}
                className="h-10 px-4 rounded-xl bg-red-500/10 text-red-200 hover:bg-red-500/20 border border-red-500/20 transition-all text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                <Trash2 size={14} /> Remover do banco
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--ds-border-default)] bg-[var(--ds-bg-elevated)] p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--ds-text-primary)] mb-2">Meta App ID</label>
                <input
                  type="text"
                  value={appIdDraft}
                  onChange={(e) => setAppIdDraft(e.target.value)}
                  placeholder="ex: 123456789012345"
                  className="w-full px-4 py-3 bg-[var(--ds-bg-elevated)] border border-[var(--ds-border-default)] rounded-xl focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 outline-none font-mono text-sm text-[var(--ds-text-primary)] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ds-text-primary)] mb-2">Meta App Secret</label>
                <input
                  type="password"
                  value={appSecretDraft}
                  onChange={(e) => setAppSecretDraft(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-3 bg-[var(--ds-bg-elevated)] border border-[var(--ds-border-default)] rounded-xl focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 outline-none font-mono text-sm text-[var(--ds-text-primary)] transition-all"
                />
                <p className="text-xs text-[var(--ds-text-muted)] mt-2">
                  Por segurança, nunca mostramos o secret atual. Para trocar, cole um novo e salve.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="h-10 px-4 rounded-xl border border-[var(--ds-border-default)] text-[var(--ds-text-primary)] font-medium hover:bg-[var(--ds-bg-hover)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="h-10 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
