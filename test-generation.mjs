import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const MARKETING_PROMPT = `
VOCÊ É UM COPYWRITER SÊNIOR ESPECIALISTA EM WHATSAPP MARKETING.
Sua missão é transformar inputs do usuário em templates de ALTA CONVERSÃO.

## 🎯 OBJETIVO
Criar mensagens que vendam, engajem e gerem cliques.
Categoria Meta: **MARKETING**.

## 📝 REGRAS
- Variáveis: APENAS números {{1}}, {{2}}, etc. (sequenciais)
- {{1}} = nome do cliente (OBRIGATÓRIO em todos os templates)
- Body: máximo 1024 caracteres (ideal: 200-400)
- Nome: snake_case, apenas letras minúsculas e underscore

## INPUT DO USUÁRIO
"{{prompt}}"

## LINGUAGEM
Escreva em {{language}}.

## URL DO BOTÃO
Use este link em TODOS os templates: {{primaryUrl}}

## GERE {{quantity}} TEMPLATES

## FORMATO JSON (retorne APENAS JSON válido, sem markdown, sem explicações)
[
  {
    "name": "nome_snake_case_descritivo",
    "content": "Texto persuasivo do body com emojis e formatação",
    "header": { "format": "TEXT", "text": "Headline impactante 🔥" },
    "footer": { "text": "Responda SAIR para cancelar." },
    "buttons": [
      { "type": "URL", "text": "CTA Forte Aqui", "url": "{{primaryUrl}}" }
    ]
  }
]
`;

async function testGeneration() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY não definida!');
    process.exit(1);
  }

  console.log('✅ API Key encontrada:', apiKey.substring(0, 10) + '...');

  const prompt = MARKETING_PROMPT
    .replace('{{prompt}}', 'Curso de Excel Avançado')
    .replace('{{language}}', 'português brasileiro')
    .replaceAll('{{primaryUrl}}', 'https://exemplo.com')
    .replace('{{quantity}}', '1');

  console.log('📝 Prompt length:', prompt.length);
  console.log('🚀 Chamando Gemini API...');

  try {
    const google = createGoogleGenerativeAI({ apiKey });
    const model = google('gemini-3-flash-preview');

    const result = await generateText({
      model,
      prompt,
      system: 'Respond with valid JSON only, no markdown.',
      temperature: 0.7,
    });

    console.log('\n✅ Resposta recebida!');
    console.log('📄 Raw text:', result.text);

    // Try to parse
    const cleanText = result.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanText);
    console.log('\n✅ JSON parseado com sucesso!');
    console.log(JSON.stringify(parsed, null, 2));

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGeneration();
