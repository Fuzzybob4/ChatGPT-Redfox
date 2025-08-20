'use client'
import Papa from 'papaparse'
import { useState } from 'react'

type Row = { name?: string; email?: string; phone?: string; address1?: string; city?: string; state?: string; zip?: string; stage?: string; revenue?: string|number }

export default function CustomerCsvImport({ onDone }: { onDone?: ()=>void }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()

  function onFile(e:any) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(undefined)
    Papa.parse<Row>(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        const cleaned = (res.data||[]).map(r => ({
          name: r.name?.trim(), email: r.email?.trim(), phone: r.phone?.trim(),
          address1: (r as any).address1 || (r as any).address || '', city: r.city?.trim(),
          state: r.state?.trim(), zip: r.zip?.toString().trim(), stage: r.stage?.trim(), revenue: r.revenue
        }))
        setRows(cleaned.filter(r=>r.name))
      },
      error: (err) => setError(err.message)
    })
  }

  async function upload() {
    setLoading(True)
  }
  async function upload() {
    setLoading(true)
    const res = await fetch('/api/customers/import', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ rows }) })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error||'Import failed'); return }
    onDone?.(); setRows([]); alert(`Imported ${json.inserted} customers${json.geocoded ? ' (geocoded)' : ''}.`)
  }

  return (
    <div className="card" style={{marginTop:12}}>
      <b>Import customers from CSV</b>
      <div style={{marginTop:8}}><input type="file" accept=".csv,text/csv" onChange={onFile} /></div>
      {error && <div style={{color:'#f66', marginTop:8}}>{error}</div>}
      {rows.length>0 && (
        <div style={{marginTop:12}}>
          <div style={{marginBottom:8}}>{rows.length} rows parsed. Preview first 5:</div>
          <table className="table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>City</th><th>State</th><th>Zip</th><th>Stage</th><th>Revenue</th></tr></thead>
          <tbody>{rows.slice(0,5).map((r,i)=>(<tr key={i}><td>{r.name}</td><td>{r.email}</td><td>{r.phone}</td><td>{r.address1}</td><td>{r.city}</td><td>{r.state}</td><td>{r.zip}</td><td>{r.stage}</td><td>{r.revenue as any}</td></tr>))}</tbody></table>
          <button onClick={upload} disabled={loading} className="btn-primary" style={{marginTop:8}}>{loading?'Importing…':'Import All'}</button>
        </div>
      )}
      <div style={{marginTop:8, opacity:.8, fontSize:12}}>Headers: name, email, phone, address1 (or address), city, state, zip, stage, revenue</div>
    </div>
  )
}
