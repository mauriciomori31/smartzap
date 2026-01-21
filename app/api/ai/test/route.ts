import { NextResponse } from 'next/server'
import { generateText, generateJSON } from '@/lib/ai'
import { getAiPromptsConfig } from '@/lib/ai/ai-center-config'

export async function GET() {
  const results: Record<string, unknown> = {}

  // 1. Test prompts config
  try {
    const prompts = await getAiPromptsConfig()
    results.promptsConfig = {
      success: true,
      strategyMarketing: prompts.strategyMarketing?.length || 0,
      strategyUtility: prompts.strategyUtility?.length || 0,
      strategyBypass: prompts.strategyBypass?.length || 0,
    }
  } catch (error) {
    results.promptsConfig = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  // 2. Test simple text generation
  try {
    const result = await generateText({
      prompt: 'Say "hello" in JSON format: {"message": "hello"}',
    })
    results.generateText = {
      success: true,
      text: result.text.substring(0, 100),
      provider: result.provider,
      model: result.model,
    }
  } catch (error) {
    results.generateText = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  // 3. Test JSON generation
  try {
    const result = await generateJSON<{ message: string }>({
      prompt: 'Return this JSON: [{"name": "test", "content": "hello"}]',
    })
    results.generateJSON = {
      success: true,
      result,
    }
  } catch (error) {
    results.generateJSON = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  return NextResponse.json(results)
}
