-- =============================================================================
-- ADD MISSING FK INDEXES
-- Migração: 20260122000001_add_missing_fk_indexes.sql
-- Objetivo: Adicionar índices em foreign keys para melhorar JOINs e DELETEs
-- =============================================================================

-- Índices identificados pelo Supabase Advisor como "unindexed_foreign_keys"
-- Estes índices melhoram performance de JOINs e operações CASCADE DELETE

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_contact_id
    ON campaign_contacts(contact_id);

CREATE INDEX IF NOT EXISTS idx_inbox_conversation_labels_label_id
    ON inbox_conversation_labels(label_id);

CREATE INDEX IF NOT EXISTS idx_inbox_conversations_ai_agent_id
    ON inbox_conversations(ai_agent_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_status_events_campaign_contact_id
    ON whatsapp_status_events(campaign_contact_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_status_events_campaign_id
    ON whatsapp_status_events(campaign_id);

CREATE INDEX IF NOT EXISTS idx_workflows_active_version_id
    ON workflows(active_version_id);
