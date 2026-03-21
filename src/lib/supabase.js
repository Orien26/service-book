import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Copy .env.example to .env and fill in your values.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Storage helpers ──────────────────────────────────────────────────────────

export async function uploadFile(file, jobId, mediaType) {
  const ext = file.name.split('.').pop()
  const path = `jobs/${jobId}/${mediaType}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('job-media')
    .upload(path, file, { upsert: false })

  if (error) throw error
  return path
}

export async function getSignedUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from('job-media')
    .createSignedUrl(storagePath, 60 * 60) // 1 hour

  if (error) throw error
  return data.signedUrl
}

// ─── Audit log helper ─────────────────────────────────────────────────────────

export async function logAction(tableName, recordId, action, data) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('audit_log').insert({
    table_name: tableName,
    record_id: recordId,
    action,
    data,
    performed_by: user?.id,
  })
}

// ─── Notification helper ──────────────────────────────────────────────────────
// Creates a notification record. Actual email delivery requires a
// Supabase Edge Function that listens to inserts on this table and
// calls an email provider (e.g. Resend: resend.com).

export async function createNotification(clientId, jobId, type, message) {
  const { error } = await supabase.from('notifications').insert({
    client_id: clientId,
    job_id: jobId,
    type,
    message,
  })
  if (error) console.warn('Notification insert failed:', error.message)
}
