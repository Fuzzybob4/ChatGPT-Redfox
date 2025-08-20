'use client'
import { useEffect, useState } from 'react'
import BrandChart from '@/components/BrandChart'
import Sidebar from '@/components/Sidebar'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function DashboardPage() {
  const [labels, setLabels] = useState<string[]>([])
  const [data, setData] = useState<number[]>([])

  useEffect(() => {
    const now = new Date()
    const weeks: string[] = []
    for (let w=5; w>=0; w--) {
      const d = new Date(now.getTime() - w*7*24*60*60*1000)
      weeks.push(`${d.getMonth()+1}/${d.getDate()}`)
    }
    setLabels(weeks)
    setData([2,4,3,5,6,8])
  }, [])

  return (
    <div style={{display:'grid', gridTemplateColumns:'240px 1fr'}}>
      <Sidebar />
      <div style={{padding:16}}>
        <h1>Dashboard</h1>
        <div className="card">
          <b>Signups (last 6 weeks)</b>
          <BrandChart labels={labels} data={data} />
        </div>
      </div>
    </div>
  )
}
