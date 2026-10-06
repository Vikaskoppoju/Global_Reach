import 'server-only'
import { pool } from '@/lib/server/db'
import { InputError } from '@/lib/server/atlas-repo'

export const MAX_UPLOAD_BYTES = 1024 * 1024 // 1 MB is plenty for a logo

// Detect the type from the file's first bytes rather than trusting its name or the browser.
// SVG is deliberately not accepted: it can carry scripts.
function sniffImageType(bytes: Buffer): string | null {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))) return 'image/gif'
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  return null
}

export async function saveUpload(file: File, actor: string): Promise<{ id: number; url: string }> {
  if (file.size === 0) throw new InputError('The file is empty.')
  if (file.size > MAX_UPLOAD_BYTES) throw new InputError('Logos must be 1 MB or smaller.')
  const bytes = Buffer.from(await file.arrayBuffer())
  const contentType = sniffImageType(bytes)
  if (!contentType) throw new InputError('Upload a PNG, JPEG, WebP or GIF image.')
  const { rows: [r] } = await pool.query(
    'INSERT INTO uploads (content_type, data, byte_size, original_name, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [contentType, bytes, bytes.length, file.name.slice(0, 255) || null, actor])
  return { id: r.id, url: `/api/uploads/${r.id}` }
}

export async function getUpload(id: number): Promise<{ contentType: string; data: Buffer } | null> {
  const { rows: [r] } = await pool.query('SELECT content_type, data FROM uploads WHERE id = $1', [id])
  return r ? { contentType: r.content_type, data: r.data } : null
}
