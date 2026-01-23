'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Storage keys matching /install/start
// Nota: QSTASH_SIGNING_KEY foi removido pois não é coletado pelo wizard
const STORAGE_KEYS = {
  VERCEL_TOKEN: 'smartzap_install_vercel_token',
  VERCEL_PROJECT: 'smartzap_install_vercel_project',
  SUPABASE_PAT: 'smartzap_install_supabase_pat',
  QSTASH_TOKEN: 'smartzap_install_qstash_token',
  REDIS_REST_URL: 'smartzap_install_redis_url',
  REDIS_REST_TOKEN: 'smartzap_install_redis_token',
} as const;

/**
 * Router page for installation.
 *
 * Decides where to redirect:
 * - If all tokens present → /install/wizard
 * - Otherwise → /install/start
 */
export default function InstallRouterPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if all required tokens are present
    const hasAllTokens =
      localStorage.getItem(STORAGE_KEYS.VERCEL_TOKEN) &&
      localStorage.getItem(STORAGE_KEYS.VERCEL_PROJECT) &&
      localStorage.getItem(STORAGE_KEYS.SUPABASE_PAT) &&
      localStorage.getItem(STORAGE_KEYS.QSTASH_TOKEN) &&
      localStorage.getItem(STORAGE_KEYS.REDIS_REST_URL) &&
      localStorage.getItem(STORAGE_KEYS.REDIS_REST_TOKEN);

    if (hasAllTokens) {
      router.replace('/install/wizard');
    } else {
      router.replace('/install/start');
    }
  }, [router]);

  // Loading state while deciding
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/20">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-zinc-400 text-sm">Carregando...</p>
      </motion.div>
    </div>
  );
}
