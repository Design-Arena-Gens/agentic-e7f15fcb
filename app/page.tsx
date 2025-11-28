import Link from 'next/link'
import Map from '../components/Map'
import ChatPanel from '../components/ChatPanel'

export default function Page() {
  return (
    <main className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <header className="px-6 py-4 border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">ChatPT Atlas</h1>
          <nav className="text-sm text-white/70 space-x-6">
            <Link className="hover:text-white" href="#">Home</Link>
            <Link className="hover:text-white" href="https://openstreetmap.org" target="_blank">Data</Link>
            <Link className="hover:text-white" href="https://leafletjs.com" target="_blank">Leaflet</Link>
          </nav>
        </div>
      </header>

      <section className="grid md:grid-cols-2 gap-0">
        <div className="h-[60vh] md:h-[calc(100vh-8rem)] border-b md:border-b-0 md:border-r border-white/10">
          <Map />
        </div>
        <div className="h-[calc(100vh-8rem)] overflow-hidden">
          <ChatPanel />
        </div>
      </section>

      <footer className="px-6 py-3 text-center text-xs text-white/60 border-t border-white/10">
        <div className="max-w-6xl mx-auto">Map data ? OpenStreetMap contributors ? Tiles ? OpenStreetMap ? Built with Next.js</div>
      </footer>
    </main>
  )
}
