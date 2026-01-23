-- =============================================================================
-- FIX FUNCTION SEARCH_PATH
-- Migração: 20260122000002_fix_function_search_path.sql
-- Objetivo: Corrigir funções com search_path mutável (security warning)
-- =============================================================================

-- Fix: increment_campaign_stat(text, text) - versão antiga
CREATE OR REPLACE FUNCTION public.increment_campaign_stat(campaign_id_input text, field text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF field = 'sent' THEN
    UPDATE campaigns SET sent = COALESCE(sent, 0) + 1 WHERE id = campaign_id_input;
  ELSIF field = 'delivered' THEN
    UPDATE campaigns SET delivered = COALESCE(delivered, 0) + 1 WHERE id = campaign_id_input;
  ELSIF field = 'read' THEN
    UPDATE campaigns SET read = COALESCE(read, 0) + 1 WHERE id = campaign_id_input;
  ELSIF field = 'failed' THEN
    UPDATE campaigns SET failed = COALESCE(failed, 0) + 1 WHERE id = campaign_id_input;
  END IF;
END;
$function$;

-- Fix: search_embeddings(vector, uuid, int, float, int) - versão antiga
CREATE OR REPLACE FUNCTION public.search_embeddings(
    query_embedding vector,
    agent_id_filter uuid,
    expected_dimensions integer,
    match_threshold double precision DEFAULT 0.5,
    match_count integer DEFAULT 5
)
RETURNS TABLE(id uuid, content text, similarity double precision, metadata jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.content,
    (1 - (e.embedding <=> query_embedding))::FLOAT AS similarity,
    e.metadata
  FROM ai_embeddings e
  WHERE e.agent_id = agent_id_filter
    AND e.dimensions = expected_dimensions
    AND (1 - (e.embedding <=> query_embedding)) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;
