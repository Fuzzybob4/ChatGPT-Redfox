'use client'
import { useEffect, useRef } from 'react'
import { Chart, BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend)

export default function BrandChart({ labels, data }: { labels: string[], data: number[] }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const ctx = ref.current.getContext('2d')!
    const styles = getComputedStyle(document.documentElement)
    const orange = styles.getPropertyValue('--rf-orange-400').trim() || '#FF9C00'
    const ink = styles.getPropertyValue('--rf-ink').trim() || '#ffffff'
    const chart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'New users', data, backgroundColor: orange }] },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: ink } } },
        scales: { x: { ticks: { color: ink } }, y: { ticks: { color: ink } } }
      }
    })
    return () => chart.destroy()
  }, [labels.join(','), data.join(',')])
  return <canvas ref={ref} height={140}/>
}
