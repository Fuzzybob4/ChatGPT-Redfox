'use client'
import Sidebar from '@/components/Sidebar'
import dynamic from 'next/dynamic'

const CustomerMap = dynamic(() => import('@/components/CustomerMap'), { ssr: false })

export default function CustomerMapPage() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'240px 1fr'}}>
      <Sidebar />
      <div style={{padding:16}}>
        <h1>Customer Map</h1>
        <CustomerMap />
      </div>
    </div>
  )
}
