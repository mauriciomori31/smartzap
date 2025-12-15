'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Page, PageActions, PageDescription, PageHeader, PageTitle } from '@/components/ui/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FlowBuilderCanvas } from '@/components/features/flows/builder/FlowBuilderCanvas'
import { FlowFormBuilder } from '@/components/features/flows/builder/FlowFormBuilder'
import { FlowJsonEditorPanel } from '@/components/features/flows/builder/FlowJsonEditorPanel'
import { useFlowEditorController } from '@/hooks/useFlowEditor'

export default function FlowBuilderEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = React.use(params)

  const controller = useFlowEditorController(id)

  const flow = controller.flow

  const [name, setName] = React.useState('')
  const [metaFlowId, setMetaFlowId] = React.useState<string>('')

  React.useEffect(() => {
    if (!flow) return
    setName(flow.name || '')
    setMetaFlowId(flow.meta_flow_id || '')
  }, [flow?.id])

  const shouldShowLoading = controller.isLoading

  return (
    <Page>
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>Editor de Flow</PageTitle>
          <PageDescription>
            Flow é um formulário. Crie perguntas no modo "Formulário" e o SmartZap gera o Flow JSON automaticamente. O Meta Flow ID serve para cruzar envios/submissões.
          </PageDescription>
        </div>
        <PageActions>
          <div className="flex items-center gap-2">
            <Link href="/templates?tab=flows">
              <Button variant="outline" className="border-white/10 bg-zinc-900 hover:bg-white/5">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => controller.save({ name, metaFlowId: metaFlowId || undefined })}
              disabled={controller.isSaving}
              className="border-white/10 bg-zinc-900 hover:bg-white/5"
            >
              {controller.isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar meta
            </Button>

            <Link href="/flows/builder">
              <Button variant="outline" className="border-white/10 bg-zinc-900 hover:bg-white/5">
                Lista
              </Button>
            </Link>
          </div>
        </PageActions>
      </PageHeader>

      {shouldShowLoading ? (
        <div className="glass-panel p-8 rounded-xl text-gray-300 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          Carregando flow...
        </div>
      ) : controller.isError ? (
        <div className="glass-panel p-8 rounded-xl text-red-300 space-y-2">
          <div className="font-medium">Falha ao carregar flow.</div>
          <div className="text-sm text-red-200/90 whitespace-pre-wrap">
            {controller.error?.message || 'Erro desconhecido'}
          </div>
          <div>
            <Button variant="outline" onClick={() => router.refresh()} className="border-white/10 bg-zinc-900 hover:bg-white/5">
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : !flow ? (
        <div className="glass-panel p-8 rounded-xl text-gray-300">Flow não encontrado.</div>
      ) : (
        <>
          <div className="glass-panel p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Meta Flow ID (opcional)</label>
                <Input value={metaFlowId} onChange={(e) => setMetaFlowId(e.target.value)} placeholder="Cole o flow_id da Meta" />
              </div>
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="text-sm text-gray-300">
              Você <span className="font-semibold">não precisa saber JSON</span> para criar um Flow.
              Use o modo <span className="font-semibold">Formulário</span> (recomendado). O canvas e o JSON ficam como opções avançadas.
            </div>
          </div>

          <Tabs defaultValue="form" className="mt-2">
            <TabsList className="bg-zinc-900/60 border border-white/10">
              <TabsTrigger value="form">Formulário (recomendado)</TabsTrigger>
              <TabsTrigger value="visual">Canvas</TabsTrigger>
              <TabsTrigger value="json">Avançado (JSON)</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-4">
              <FlowFormBuilder
                flowName={name}
                currentSpec={controller.spec}
                isSaving={controller.isSaving}
                onSave={(patch) => {
                  controller.save({
                    ...(patch.spec !== undefined ? { spec: patch.spec } : {}),
                    ...(patch.flowJson !== undefined ? { flowJson: patch.flowJson } : {}),
                  })
                }}
              />
            </TabsContent>

            <TabsContent value="visual">
              <div className="min-h-130">
                <FlowBuilderCanvas
                  name={name}
                  metaFlowId={metaFlowId || null}
                  initialSpec={controller.spec}
                  isSaving={controller.isSaving}
                  onSave={(patch) => {
                    controller.save({
                      ...(patch.name !== undefined ? { name: patch.name } : {}),
                      ...(patch.metaFlowId !== undefined ? { metaFlowId: patch.metaFlowId } : {}),
                      ...(patch.spec !== undefined ? { spec: patch.spec } : {}),
                    })
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="json">
              <FlowJsonEditorPanel
                flowId={flow.id}
                flowName={flow.name}
                value={(flow as any).flow_json}
                isSaving={controller.isSaving}
                onSave={(flowJson) => controller.save({ flowJson })}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </Page>
  )
}
