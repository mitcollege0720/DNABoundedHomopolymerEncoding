import { useState, useCallback } from 'react'
import { benchmark } from '../api'

interface ParsedBenchmark {
  maxBits: string
  encTime: string
  decTime: string
}

function parseOutput(output: string): ParsedBenchmark {
  const maxMatch = output.match(/Max data bits that can be encoded:\s*(\d+)/)
  const encMatch = output.match(/Encoding time:\s*(\d+)\s*milliseconds/)
  const decMatch = output.match(/Decoding time:\s*(\d+)\s*milliseconds/)
  return {
    maxBits: maxMatch ? maxMatch[1] : '—',
    encTime: encMatch ? encMatch[1] : '—',
    decTime: decMatch ? decMatch[1] : '—',
  }
}

export default function Benchmark() {
  const [k, setK] = useState(3)
  const [encodingLength, setEncodingLength] = useState(100)
  const [inputLength, setInputLength] = useState(180)
  const [trials, setTrials] = useState(1000)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ParsedBenchmark | null>(null)
  const [error, setError] = useState('')

  const handleRun = useCallback(async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await benchmark(k, encodingLength, inputLength, trials)
      if (res.error) { setError(res.error) }
      else { setResult(parseOutput(res.output)) }
    } catch (e) {
      setError('Failed to connect to server')
    }
    setLoading(false)
  }, [k, encodingLength, inputLength, trials])

  const encMbps = result && result.encTime !== '—'
    ? ((parseInt(result.encTime) > 0 ? (trials * inputLength / parseInt(result.encTime) / 1000) : 0)).toFixed(1)
    : null
  const decMbps = result && result.decTime !== '—'
    ? ((parseInt(result.decTime) > 0 ? (trials * inputLength / parseInt(result.decTime) / 1000) : 0)).toFixed(1)
    : null

  return (
    <div className="benchmark animate-fade-in-up">
      <div className="card">
        <h2 className="card-title">Benchmark</h2>
        <p className="card-subtitle">
          Measure encoding and decoding throughput with random data
        </p>

        <div className="param-grid">
          <div className="param-group">
            <label>Max homopolymer run (k)</label>
            <div className="k-selector">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  className={`k-btn ${k === val ? 'active' : ''}`}
                  onClick={() => setK(val)}
                >{val}</button>
              ))}
            </div>
          </div>
          <div className="param-group">
            <label>Encoding length (bases)</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={encodingLength}
              onChange={e => setEncodingLength(Math.max(1, parseInt(e.target.value) || 1))}
              className="param-input"
            />
          </div>
          <div className="param-group">
            <label>Input length (bits)</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={inputLength}
              onChange={e => setInputLength(Math.max(1, parseInt(e.target.value) || 1))}
              className="param-input"
            />
          </div>
          <div className="param-group">
            <label>Number of trials</label>
            <input
              type="number"
              min="1"
              max="100000"
              value={trials}
              onChange={e => setTrials(Math.max(1, parseInt(e.target.value) || 1))}
              className="param-input"
            />
          </div>
        </div>

        <div className="action-row">
          <button className="btn-primary" onClick={handleRun} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Run Benchmark'}
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {result && (
          <div className="benchmark-results animate-fade-in">
            <div className="benchmark-grid">
              <div className="benchmark-card">
                <div className="benchmark-card-label">Max data bits</div>
                <div className="benchmark-card-value mono">{result.maxBits}</div>
              </div>
              <div className="benchmark-card">
                <div className="benchmark-card-label">Encoding time</div>
                <div className="benchmark-card-value mono">{result.encTime} ms</div>
                {encMbps && <div className="benchmark-card-sub">{encMbps} Mbps</div>}
              </div>
              <div className="benchmark-card">
                <div className="benchmark-card-label">Decoding time</div>
                <div className="benchmark-card-value mono">{result.decTime} ms</div>
                {decMbps && <div className="benchmark-card-sub">{decMbps} Mbps</div>}
              </div>
              <div className="benchmark-card">
                <div className="benchmark-card-label">Total data</div>
                <div className="benchmark-card-value mono">{(trials * inputLength).toLocaleString()}</div>
                <div className="benchmark-card-sub">{trials} × {inputLength} bits</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
