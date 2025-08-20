import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="rf-gradient" style={{backgroundImage:'url(/hero.jpg)', backgroundSize:'cover', backgroundPosition:'center', padding:'48px 24px', borderRadius:16}}>
      <div style={{maxWidth: 980, margin:'0 auto'}}>
        <h1 style={{fontSize:48, marginBottom:8}}>RedFox CRM</h1>
        <p style={{opacity:.85, maxWidth:680}}>Close seasonal lighting deals faster. Send estimates, collect deposits, schedule crews with route optimization — all in one lightweight CRM.</p>
        <div style={{display:'flex', gap:12, marginTop:16}}>
          <Link className="btn-primary" href="/register">Start free trial</Link>
          <Link className="btn-ghost" href="/login">Log In</Link>
        </div>
        <div className="grid grid-3" style={{marginTop:28}}>
          <div className="card"><b><img src="/icons/invoices.png" width="20" style={{verticalAlign:'-3px', marginRight:6}}/>Estimates</b><div>1‑click approval links.</div></div>
          <div className="card"><b><img src="/icons/payments.png" width="20" style={{verticalAlign:'-3px', marginRight:6}}/>Invoices</b><div>Stripe-powered payments.</div></div>
          <div className="card"><b><img src="/icons/calendar.png" width="20" style={{verticalAlign:'-3px', marginRight:6}}/>Scheduling</b><div>Route-aware day planning.</div></div>
        </div>
      </div>
    </div>
  )
}
