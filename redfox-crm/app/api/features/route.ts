import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  const supa = supabaseServer()
  const { data: { user } } = await supa.auth.getUser()
  if (!user) return NextResponse.json({ features: [], plan: 'starter' })
  const { data: prof } = await supa.from('profiles').select('org_id, role').eq('id', user.id).single()
  const orgId = prof?.org_id
  const { data: sub } = await supa.from('org_subscriptions').select('plan_id, status, trial_end').eq('org_id', orgId).maybeSingle()
  const planId = sub?.plan_id || 'starter'
  const { data: plan } = await supa.from('plans').select('*').eq('id', planId).single()
  return NextResponse.json({
    plan: planId, status: sub?.status || 'trialing', trial_end: sub?.trial_end || null,
    features: plan?.features || [], caps: { customers: plan?.monthly_customer_cap, employees: plan?.employee_cap },
    role: prof?.role || 'owner'
  })
}
