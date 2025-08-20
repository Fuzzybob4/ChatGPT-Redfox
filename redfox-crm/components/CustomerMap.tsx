'use client'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
// @ts-ignore
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useEffect, useMemo, useState } from 'react'

type Pin = { id: string, name: string, address?: string|null, lat: number, lng: number, latest_stage?: string|null, last_job_date?: string|null, total_revenue?: number|null, install_status?: 'installed'|'pending'|'not_installed' }

function colorFor(status?: string) {
  if (status === 'installed') return '#00C853' // green
  if (status === 'pending') return '#FFD600' // yellow
  return '#FF1744' // red
}

export default function CustomerMap() {
  const [pins, setPins] = useState<Pin[]>([])
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState<string>('')
  const [minRevenue, setMinRevenue] = useState<string>('')
  const [minDate, setMinDate] = useState<string>('')
  const [showInstalled, setShowInstalled] = useState(true)
  const [showPending, setShowPending] = useState(true)
  const [showNotInstalled, setShowNotInstalled] = useState(true)

  async function fetchPins() {
    setLoading(true)
    const params = new URLSearchParams()
    if (stage) params.set('stage', stage)
    if (minRevenue) params.set('min_revenue', minRevenue)
    if (minDate) params.set('min_last_job_date', minDate)
    const res = await fetch('/api/customers/geo?'+params.toString())
    const data = await res.json()
    setPins(data); setLoading(false)
  }

  useEffect(() => { fetchPins() }, [])

  const filtered = useMemo(() => pins.filter(p => (
    (p.install_status === 'installed' && showInstalled) ||
    (p.install_status === 'pending' && showPending) ||
    (p.install_status === 'not_installed' && showNotInstalled)
  )), [pins, showInstalled, showPending, showNotInstalled])

  const center = filtered.length ? [filtered[0].lat, filtered[0].lng] as [number, number] : [30.2672, -97.7431]

  return (
    <div>
      <div className="card" style={{marginBottom:12}}>
        <b>Filters</b>
        <div style={{display:'flex', gap:12, marginTop:8, flexWrap:'wrap'}}>
          <label>Stage
            <select value={stage} onChange={e=>setStage(e.target.value)}>
              <option value="">Any</option>
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
              <option value="estimate_sent">Estimate Sent</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </label>
          <label>Min Revenue ($)<input type="number" value={minRevenue} onChange={e=>setMinRevenue(e.target.value)} placeholder="0" /></label>
          <label>Last Job Since<input type="date" value={minDate} onChange={e=>setMinDate(e.target.value)} /></label>
          <button onClick={fetchPins}>Apply</button>
        </div>
        <div style={{marginTop:8, display:'flex', gap:20, alignItems:'center', flexWrap:'wrap'}}>
          <label style={{display:'flex', alignItems:'center', gap:6}}><input type="checkbox" checked={showInstalled} onChange={e=>setShowInstalled(e.target.checked)} /><span><span style={{display:'inline-block', width:12, height:12, background:'#00C853', borderRadius:6, marginRight:6}}/>Installed</span></label>
          <label style={{display:'flex', alignItems:'center', gap:6}}><input type="checkbox" checked={showPending} onChange={e=>setShowPending(e.target.checked)} /><span><span style={{display:'inline-block', width:12, height:12, background:'#FFD600', borderRadius:6, marginRight:6}}/>Pending</span></label>
          <label style={{display:'flex', alignItems:'center', gap:6}}><input type="checkbox" checked={showNotInstalled} onChange={e=>setShowNotInstalled(e.target.checked)} /><span><span style={{display:'inline-block', width:12, height:12, background:'#FF1744', borderRadius:6, marginRight:6}}/>Not installed / Removed</span></label>
        </div>
      </div>
      <div className="card" style={{height:'70vh', padding:0, overflow:'hidden'}}>
        {!loading && (
          <MapContainer center={center} zoom={11} style={{height:'100%', width:'100%'}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <MarkerClusterGroup chunkedLoading>
              {filtered.map(p => (
                <CircleMarker key={p.id + String(p.lat)+String(p.lng)} center={[p.lat, p.lng]} radius={10} pathOptions={{ color: colorFor(p.install_status), fillColor: colorFor(p.install_status), fillOpacity: 0.9 }}>
                  <Popup>
                    <b>{p.name}</b>
                    {p.address && <div style={{marginTop:4}}>{p.address}</div>}
                    {p.latest_stage && <div><b>Stage:</b> {p.latest_stage}</div>}
                    {p.total_revenue != null && <div><b>Revenue:</b> ${Number(p.total_revenue).toFixed(2)}</div>}
                    {p.last_job_date && <div><b>Last Job:</b> {new Date(p.last_job_date).toLocaleDateString()}</div>}
                    <div><b>Status:</b> {p.install_status||'unknown'}</div>
                  </Popup>
                </CircleMarker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>
    </div>
  )
}
