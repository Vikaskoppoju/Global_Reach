import 'server-only'
import { pool } from '@/lib/server/db'
import { InputError, NotFoundError } from '@/lib/server/atlas-repo'
import { NOT_SURE, getService, isEnquiryOption } from '@/lib/services'
import type { EnquiryStatus, ServiceEnquiry } from '@/types'

export const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'contacted', 'enrolled', 'closed']
export const CALL_TIMES = ['morning', 'afternoon', 'evening', 'any']

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// 7–15 digits once spaces, dashes, brackets and a leading + are removed
const PHONE = /^\+?\d{7,15}$/

function text(input: Record<string, unknown>, key: string, max: number, required = false) {
  const raw = input[key]
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (required && !value) throw new InputError(`Please fill in ${key === 'name' ? 'your name' : `the ${key} field`}.`)
  if (value.length > max) throw new InputError(`The ${key} field is too long (at most ${max} characters).`)
  return value || null
}

export async function createEnquiry(input: Record<string, unknown>) {
  // Students who don't know what they need yet can leave the service empty
  const service = text(input, 'service', 60) ?? NOT_SURE
  if (service !== NOT_SURE && !isEnquiryOption(service)) throw new InputError('Please choose a service.')
  const pkg = text(input, 'package', 80)
  if (pkg && getService(service) && !getService(service)!.packages.some(p => p.name === pkg)) {
    throw new InputError('Please choose one of the listed options.')
  }
  const name = text(input, 'name', 120, true)!
  const phone = text(input, 'phone', 30)
  if (!phone) throw new InputError('Please enter your phone or WhatsApp number, so we can call you back.')
  if (!PHONE.test(phone.replace(/[\s\-()]/g, ''))) throw new InputError('Please enter a valid phone number, with the country code if you’re outside India.')
  const email = text(input, 'email', 200)
  if (email && !EMAIL.test(email)) throw new InputError('Please enter a valid email address, or leave it empty.')
  const callTime = text(input, 'callTime', 20)
  if (callTime && !CALL_TIMES.includes(callTime)) throw new InputError('Please choose a time to call.')
  if (input.consent !== true) throw new InputError('Please agree that we can call you about your request.')

  const { rows } = await pool.query(
    `INSERT INTO service_enquiries
       (service, package, name, email, phone, call_time, current_score, target_intake, scholarship_id, message, consent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true) RETURNING id`,
    [service, pkg, name, email, phone, callTime, text(input, 'currentScore', 60),
      text(input, 'targetIntake', 60), text(input, 'scholarshipId', 20), text(input, 'message', 2000)])
  return { id: Number(rows[0].id) }
}

export async function listEnquiries(opts: { status?: string; limit: number; beforeId?: number }): Promise<ServiceEnquiry[]> {
  const where: string[] = []
  const params: unknown[] = []
  if (opts.status) { params.push(opts.status); where.push(`status = $${params.length}`) }
  if (opts.beforeId) { params.push(opts.beforeId); where.push(`id < $${params.length}`) }
  params.push(opts.limit)
  const { rows } = await pool.query(
    `SELECT id, created_at, service, package, name, email, phone, call_time, current_score, target_intake,
            scholarship_id, message, status
     FROM service_enquiries
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY id DESC LIMIT $${params.length}`,
    params)
  return rows.map(r => ({
    id: Number(r.id),
    createdAt: r.created_at.toISOString(),
    service: r.service,
    package: r.package,
    name: r.name,
    email: r.email,
    phone: r.phone,
    callTime: r.call_time,
    currentScore: r.current_score,
    targetIntake: r.target_intake,
    scholarshipId: r.scholarship_id,
    message: r.message,
    status: r.status,
  }))
}

export async function updateEnquiryStatus(id: number, status: unknown) {
  if (!ENQUIRY_STATUSES.includes(status as EnquiryStatus)) throw new InputError('Unknown status.')
  const { rowCount } = await pool.query(
    'UPDATE service_enquiries SET status = $1, updated_at = now() WHERE id = $2', [status, id])
  if (!rowCount) throw new NotFoundError('Enquiry not found.')
  return { id, status }
}
