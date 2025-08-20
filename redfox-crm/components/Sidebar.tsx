'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

const allItems = [
  { href: '/dashboard', label: 'Dashboard', roles: ['owner','manager','invoicer','installer'] },
  { href: '/jobs', label: 'Jobs', roles: ['owner','manager','invoicer','installer'] },
  { href: '/invoices', label: 'Invoices', roles: ['owner','manager','invoicer'] },
  { href: '/estimates', label: 'Estimates', roles: ['owner','manager','invoicer'] },
  { href: '/schedule', label: 'Schedule', roles: ['owner','manager','invoicer'] },
  { href: '/customers', label: 'Customers', roles: ['owner','manager','invoicer','installer'] },
  { href: '/sales', label: 'Sales', roles: ['owner','manager','invoicer'] },
  { href: '/profile', label: 'Profile', roles: ['owner','manager','invoicer','installer'] }
]

const ICONS: Record<string,string> = {
  '/dashboard': '/icons/dashboard.png',
  '/customers': '/icons/customers.png',
  '/estimates': '/icons/invoices.png',
  '/invoices': '/icons/payments.png',
  '/jobs': '/icons/jobs.png',
  '/schedule': '/icons/calendar.png',
  '/customers/map': '/icons/map.png',
  '/sales': '/icons/reports.png',
  '/profile': '/icons/settings.png'
}

function iconFor(href: string) { return ICONS[href] || '' }

export default function Sidebar() {
  const pathname = usePathname()
  const [role, setRole] = useState<string>('owner')
  useEffect(() => {
    (async () => {
      const supa = supabaseBrowser()
      const user = (await supa.auth.getUser()).data.user
      if (!user) return
      const prof = await supa.from('profiles').select('role').eq('id', user.id).maybeSingle()
      setRole(prof.data?.role || 'owner')
    })()
  }, [])
  const items = allItems.filter(i => i.roles.includes(role))
  return (
    <aside>
      <div className="logo">RedFox CRM</div>
      <nav>
        <ul>
          {items.map(i => (
            <li key={i.href} className={pathname.startsWith(i.href) ? 'active' : ''}>
              <Link href={i.href} className="nav-link" style={{display:'flex', alignItems:'center', gap:8}}>
                {iconFor(i.href) && <img src={iconFor(i.href)} alt="" width={18} height={18} />}
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <style jsx>{`
        .logo { font-weight: 700; margin-bottom: 12px; color: var(--rf-orange-400); }
        ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        li.active a { font-weight: 700; }
      `}</style>
    </aside>
  )
}
