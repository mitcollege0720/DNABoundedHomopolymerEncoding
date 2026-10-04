import { useState } from 'react'
import Hero from './components/Hero'
import CodecLab from './components/CodecLab'
import RateExplorer from './components/RateExplorer'
import Benchmark from './components/Benchmark'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'

export type Tab = 'codec' | 'rates' | 'benchmark' | 'how'

export default function App() {
  const [tab, setTab] = useState<Tab>('codec')

  return (
    <div className="app">
      <Hero tab={tab} setTab={setTab} />
      <main className="main-content">
        {tab === 'codec' && <CodecLab />}
        {tab === 'rates' && <RateExplorer />}
        {tab === 'benchmark' && <Benchmark />}
        {tab === 'how' && <HowItWorks />}
      </main>
      <Footer />
    </div>
  )
}
