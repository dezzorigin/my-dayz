import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// Supabase — lapisan sinkronisasi cloud (OPSIONAL, belum aktif).
//
// Kenyataan hari ini: seluruh data MyDayz tersimpan lokal di browser
// (Zustand + localStorage, lihat docs/SCHEMA.md). Modul ini sengaja dibuat
// malas (lazy) dan penjaga (guarded):
//   - `getSupabase()` mengembalikan `null` bila env belum terpasang, jadi
//     import modul ini TIDAK PERNAH meledak saat build/deploy tanpa env.
//   - Versi sebelumnya memanggil `createClient(url!, key!)` di tingkat modul
//     — tanpa env, modul itu melempar saat di-import. Tidak ada kode yang
//     meng-import-nya hari ini; saat integrasi Auth/sync dibangun, pakai
//     `getSupabase()` dan tangani `null` sebagai "mode lokal".
// Isi .env.local dari .env.example; JANGAN pernah commit .env*.
// ─────────────────────────────────────────────────────────────────────────────

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    client = null;
    return client;
  }
  client = createClient(url, anonKey);
  return client;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}

// Backwards-compat: kode lama yang meng-import `supabase` langsung mendapat
// null (bukan throw) bila env kosong. Jangan pakai ini untuk kode baru.
export const supabase: SupabaseClient | null = getSupabase();
