import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  const supa = supabaseServer()
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage')
  const minRev = searchParams.get('min_revenue')
  const minDate = searchParams.get('min_last_job_date')

  // Use extended metrics view if present, else fall back to basic locations+customers
  let { data, error } = await supa.from('customer_metrics_ext')
    .select('customer_id,name,lat,lng,address1,city,state,zip,latest_stage,last_job_date,total_revenue,last_job_status')
  if (error) {
    const basic = await supa.from('locations').select('customer_id,address1,city,state,zip,lat,lng')
    const names = await supa.from('customers').select('id,name')
    const nameMap = Object.fromEntries((names.data||[]).map((n:any)=>[n.id,n.name]))
    const pins = (basic.data||[]).filter((r:any)=>r.lat && r.lng).map((r:any)=>({ id:r.customer_id, name:nameMap[r.customer_id]||'Customer', lat:r.lat, lng:r.lng, install_status:'pending' }))
    return NextResponse.json(pins)
  }

  const pins = (data||[]).filter((r:any)=>r.lat && r.lng).map((r:any)=>{
    let install_status: 'installed'|'pending'|'not_installed' = 'not_installed'
    if (r.last_job_status === 'complete') install_status = 'installed'
    else if (['scheduled','in_progress'].includes(r.last_job_status)) install_status = 'pending'
    return {
      id: r.customer_id,
      name: r.name,
      address: [r.address1, r.city, r.state, r.zip].filter(Boolean).join(', '),
      lat: Number(r.lat), lng: Number(r.lng),
      latest_stage: r.latest_stage, last_job_date: r.last_job_date, total_revenue: r.total_revenue,
      install_status
    }
  })
  return NextResponse.json(pins)
}
