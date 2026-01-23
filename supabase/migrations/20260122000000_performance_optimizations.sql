-- =============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- Migração: 20260122000000_performance_optimizations.sql
-- Objetivo: Consolidar queries de agregação para reduzir round-trips ao banco
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. RPC: get_campaign_contact_stats
-- Substitui 7 queries COUNT separadas por uma única query com agregação
-- Economia: 6 round-trips por visualização de campanha
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_campaign_contact_stats(p_campaign_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status IN ('pending', 'sending')),
        'sent', COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'read')),
        'delivered', COUNT(*) FILTER (WHERE status IN ('delivered', 'read')),
        'read', COUNT(*) FILTER (WHERE status = 'read'),
        'skipped', COUNT(*) FILTER (WHERE status = 'skipped'),
        'failed', COUNT(*) FILTER (WHERE status = 'failed')
    ) INTO result
    FROM campaign_contacts
    WHERE campaign_id = p_campaign_id;

    RETURN COALESCE(result, '{"total":0,"pending":0,"sent":0,"delivered":0,"read":0,"skipped":0,"failed":0}'::json);
END;
$$;

COMMENT ON FUNCTION get_campaign_contact_stats(TEXT) IS
'Retorna estatísticas agregadas de uma campanha em uma única query.
Substitui 7 queries COUNT separadas.';

-- -----------------------------------------------------------------------------
-- 2. RPC: get_contact_stats
-- Substitui o carregamento de todos os contatos para contar status
-- Economia: 100% de memória (não carrega dados, apenas conta)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_contact_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'optIn', COUNT(*) FILTER (WHERE status = 'Opt-in'),
        'optOut', COUNT(*) FILTER (WHERE status = 'Opt-out')
    ) INTO result
    FROM contacts;

    RETURN COALESCE(result, '{"total":0,"optIn":0,"optOut":0}'::json);
END;
$$;

COMMENT ON FUNCTION get_contact_stats() IS
'Retorna estatísticas de contatos (total, opt-in, opt-out) sem carregar todos os registros.';

-- -----------------------------------------------------------------------------
-- 3. RPC: get_contact_tags
-- Extrai tags únicas diretamente no SQL ao invés de carregar todos os contatos
-- Economia: Processa no banco, retorna apenas tags únicas
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_contact_tags()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT COALESCE(json_agg(DISTINCT tag ORDER BY tag), '[]'::json) INTO result
    FROM contacts, jsonb_array_elements_text(tags) AS tag
    WHERE tags IS NOT NULL AND jsonb_array_length(tags) > 0;

    RETURN COALESCE(result, '[]'::json);
END;
$$;

COMMENT ON FUNCTION get_contact_tags() IS
'Retorna array de tags únicas de todos os contatos, ordenadas alfabeticamente.';

-- -----------------------------------------------------------------------------
-- 4. RPC: get_campaigns_with_all_tags
-- Busca campanhas que têm TODAS as tags especificadas em uma única query
-- Economia: Substitui N queries (uma por tag) por uma única query
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_campaigns_with_all_tags(p_tag_ids UUID[])
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN ARRAY(
        SELECT campaign_id
        FROM campaign_tag_assignments
        WHERE tag_id = ANY(p_tag_ids)
        GROUP BY campaign_id
        HAVING COUNT(DISTINCT tag_id) = array_length(p_tag_ids, 1)
    );
END;
$$;

COMMENT ON FUNCTION get_campaigns_with_all_tags(UUID[]) IS
'Retorna IDs de campanhas que possuem TODAS as tags especificadas (AND logic).
Substitui N queries paralelas por uma única query com GROUP BY/HAVING.';
