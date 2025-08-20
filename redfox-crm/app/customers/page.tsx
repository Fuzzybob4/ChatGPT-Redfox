'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Sidebar from '@/components/Sidebar'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

const CustomerCsvImport = dynamic(() => import('@/components/CustomerCsvImport'), { ssr: false })

type Customer = { id: string, name: string, email: string|null, phone: string|null }

export default function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([])
  const [q, setQ] = useState('')
  const [hasMap, setHasMap] = useState(true) // assume enabled

  async function load() {
    const supa = supabaseBrowser()
    let query = supa.from('customers').select('id,name,email,phone').order('created_at', { ascending: false })
    if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    const { data } = await query
    setRows(data||[])
  }
  useEffect(() => { load() }, [])

  return (
    <div style={{display:'grid', gridTemplateColumns:'240px 1fr'}}>
      <Sidebar />
      <div style={{padding:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1>Customers</h1>
          {hasMap && <Link href="/customers/map">Map</Link>}
        </div>
        <div className="card" style={{margin:'12px 0'}}>
          <input placeholder="Search name, email, phone..." value={q} onChange={e=>setQ(e.target.value)} />
          <button onClick={load} style={{marginLeft:8}}>Search</button>
        </div>
        <CustomerCsvImport onDone={load} />
        <table className="table" style={{marginTop:12}}>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.email}</td><td>{r.phone}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
