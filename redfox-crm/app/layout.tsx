import './globals.css'

export const metadata = {
  title: 'RedFox CRM',
  description: 'RedFoxcrm.com • Seasonal lighting CRM'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <div className="top">RedFox CRM</div>
          <div className="shell">
            <div className="sidebar">{/* injected by Sidebar component on pages */}</div>
            <div className="content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  )
}
