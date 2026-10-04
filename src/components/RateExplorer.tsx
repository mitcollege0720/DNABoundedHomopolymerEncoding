import { useState, useEffect, useCallback } from 'react'
import { getRates, type RateResult } from '../api'

export default function RateExplorer() {
  const [encodingLength, setEncodingLength] = useState(96)
  const [results, setResults] = useState<RateResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchRates = useCallback(async (len: number) => {
    setLoading(true); setError('')
    try {
      const res = await getRates(len)
      if (res.error) { setError(res.error) }
      else { setResults(res.results) }
    } catch (e) {
      setError('Failed to connect to server')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchRates(encodingLength), 300)
    return () => clearTimeout(timer)
  }, [encodingLength, fetchRates])

  const maxRate = Math.max(...results.map(r => r.rate), 2)

  return (
    <div className="rate-explorer animate-fade-in-up">
      <div className="card">
        <h2 className="card-title">Rate Explorer</h2>
        <p className="card-subtitle">
          See how many bits per base you can achieve for each homopolymer bound at a given strand length
        </p>

        <div className="rate-controls">
          <div className="param-group">
            <label>Encoding length (bases)</label>
            <div className="slider-row">
              <input
                type="range"
                min="10"
                max="500"
                step="1"
                value={encodingLength}
                onChange={e => setEncodingLength(parseInt(e.target.value))}
                className="slider"
              />
              <input
                type="number"
                min="1"
                max="10000"
                value={encodingLength}
                onChange={e => setEncodingLength(Math.max(1, parseInt(e.target.value) || 1))}
                className="param-input small"
              />
            </div>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading && results.length === 0 ? (
          <div className="loading-state"><span className="spinner lg" /></div>
        ) : (
          <>
            <div className="rate-chart">
              {results.map(r => (
                <div key={r.k} className="rate-bar-row">
                  <div className="rate-bar-label">k = {r.k}</div>
                  <div className="rate-bar-track">
                    <div
                      className="rate-bar-fill"
                      style={{ width: `${(r.rate / maxRate) * 100}%` }}
                    >
                      <span className="rate-bar-value">{r.rate.toFixed(6)}</span>
                    </div>
                  </div>
                  <div className="rate-bar-bits">{r.max_input_bits} bits</div>
                </div>
              ))}
            </div>

            <div className="rate-table-wrap">
              <table className="rate-table">
                <thead>
                  <tr>
                    <th>k</th>
                    <th>Max input bits</th>
                    <th>Rate (bits/base)</th>
                    <th>Capacity ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.k}>
                      <td className="mono">{r.k}</td>
                      <td className="mono">{r.max_input_bits}</td>
                      <td className="mono">{r.rate.toFixed(6)}</td>
                      <td>
                        <div className="capacity-bar">
                          <div
                            className="capacity-bar-fill"
                            style={{ width: `${(r.rate / 2) * 100}%` }}
                          />
                          <span>{((r.rate / 2) * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rate-info">
              <p>
                The theoretical maximum is <strong>2 bits/base</strong> (log₂4).
                As <span className="mono">k</span> increases, the constraint relaxes and the rate
                approaches this limit. Lower <span className="mono">k</span> means stricter
                homopolymer limits — better for DNA physical fidelity, at the cost of lower
                information density.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
