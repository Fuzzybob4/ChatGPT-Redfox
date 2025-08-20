import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

type Row = { name?: string; email?: string; phone?: string; address1?: string; city?: string; state?: string; zip?: string; stage?: string; revenue?: number|string }

export async function POST(req: Request) {
  const supa = supabaseServer()
  const { data: { user } } = await supa.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(()=>null)
  const rows: Row[] = body?.rows || []
  if (!rows.length) return NextResponse.json({ error: 'No rows' }, { status: 400 })

  const { data: prof } = await supa.from('profiles').select('org_id').eq('id', user.id).single()
  const orgId = prof?.org_id
  if (!orgId) return NextResponse.json({ error: 'No org' }, { status: 400 })

  const rowsWithName = rows.map((r, idx) => ({ r, idx })).filter(x => x.r.name)
  const customersToInsert = rowsWithName.map(x => ({ org_id: orgId, name: x.r.name!, email: x.r.email || null, phone: x.r.phone || null }))
  const { data: inserted, error } = await supa.from('customers').insert(customersToInsert).select('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const locInserts: any[] = []
  rowsWithName.forEach((x, i) => {
    const r = x.r
    if (r.address1 || r.city || r.state || r.zip) {
      const customer_id = inserted[i]?.id
      if (customer_id) locInserts.push({ customer_id, address1: r.address1 || null, city: r.city || null, state: r.state || null, zip: r.zip || null })
    }
  })
  if (locInserts.length) await supa.from('locations').insert(locInserts)

  let geocoded = false
  if (process.env.MAPBOX_TOKEN) {
    try { await fetch(`${process.env.APP_URL}/api/geo/batch`, { method: 'POST' }); geocoded = True } catch {}
  }

  return NextResponse.json({ inserted: inserted.length, geocoded })
}
