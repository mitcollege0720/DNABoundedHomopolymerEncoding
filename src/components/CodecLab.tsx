import { useState, useCallback } from 'react'
import { encode, decode } from '../api'

const BASE_COLORS: Record<string, string> = { A: 'base-A', C: 'base-C', G: 'base-G', T: 'base-T' }
const BASE_NAMES: Record<string, string> = { A: 'Adenine', C: 'Cytosine', G: 'Guanine', T: 'Thymine' }

function renderBits(s: string) {
  return s.split('').map((b, i) => (
    <span key={i} className={b === '0' ? 'bit-0' : 'bit-1'}>{b}</span>
  ))
}

function renderDNA(s: string) {
  return s.split('').map((b, i) => (
    <span key={i} className={BASE_COLORS[b] || ''} title={BASE_NAMES[b] || ''}>{b}</span>
  ))
}

function maxRunLength(s: string): number {
  let max = 1, cur = 1
  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i-1]) { cur++; if (cur > max) max = cur }
    else cur = 1
  }
  return max
}

function generateRandomBits(len: number): string {
  let s = ''
  for (let i = 0; i < len; i++) s += Math.random() < 0.5 ? '0' : '1'
  return s
}

export default function CodecLab() {
  const [k, setK] = useState(3)
  const [encodingLength, setEncodingLength] = useState(25)
  const [inputLength, setInputLength] = useState(12)
  const [input, setInput] = useState('101101001011')
  const [encoded, setEncoded] = useState('')
  const [encodedDNA, setEncodedDNA] = useState('')
  const [decoded, setDecoded] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<'encode' | 'decode' | null>(null)
  const [maxRun, setMaxRun] = useState(0)

  const handleEncode = useCallback(async () => {
    setError(''); setEncoded(''); setEncodedDNA(''); setDecoded(''); setMaxRun(0)
    if (input.length !== inputLength) {
      setError(`Input must be exactly ${inputLength} bits. Current: ${input.length}`)
      return
    }
    if (!/^[01]+$/.test(input)) {
      setError('Input must contain only 0s and 1s')
      return
    }
    setLoading('encode')
    try {
      const res = await encode(k, encodingLength, inputLength, input)
      if (res.error) { setError(res.error) }
      else {
        setEncoded(res.encoded)
        setEncodedDNA(res.dna)
        setMaxRun(maxRunLength(res.dna))
      }
    } catch (e) {
      setError('Failed to connect to server')
    }
    setLoading(null)
  }, [k, encodingLength, inputLength, input])

  const handleDecode = useCallback(async () => {
    setError(''); setDecoded('')
    const data = encodedDNA || encoded
    if (!data) { setError('Nothing to decode — encode first'); return }
    setLoading('decode')
    try {
      const res = await decode(k, encodingLength, inputLength, data)
      if (res.error) { setError(res.error) }
      else { setDecoded(res.decoded) }
    } catch (e) {
      setError('Failed to connect to server')
    }
    setLoading(null)
  }, [k, encodingLength, inputLength, encodedDNA, encoded])

  const handleRandom = () => {
    setInput(generateRandomBits(inputLength))
    setEncoded(''); setEncodedDNA(''); setDecoded(''); setMaxRun(0); setError('')
  }

  const roundTripOk = decoded && decoded === input

  return (
    <div className="codec-lab animate-fade-in-up">
      <div className="card">
        <h2 className="card-title">Codec Lab</h2>
        <p className="card-subtitle">Encode binary data into DNA sequences with bounded homopolymer runs</p>

        <div className="param-grid">
          <div className="param-group">
            <label>Max homopolymer run (k)</label>
            <div className="k-selector">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  className={`k-btn ${k === val ? 'active' : ''}`}
                  onClick={() => { setK(val); setEncoded(''); setEncodedDNA(''); setDecoded(''); setMaxRun(0); setError('') }}
                >
                  {val}
                </button>
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
              onChange={e => {
                const v = Math.max(1, parseInt(e.target.value) || 1)
                setInputLength(v)
                if (input.length !== v) { setInput(''); setEncoded(''); setEncodedDNA(''); setDecoded(''); setMaxRun(0); setError('') }
              }}
              className="param-input"
            />
          </div>
        </div>

        <div className="io-section">
          <div className="io-label">
            <span>Binary Input</span>
            <button className="btn-ghost" onClick={handleRandom}>Random</button>
          </div>
          <div className="io-box input-box">
            <code className="mono">{input || <span className="placeholder">Enter binary data...</span>}</code>
          </div>
          <input
            type="text"
            className="text-input mono"
            value={input}
            onChange={e => { setInput(e.target.value.replace(/[^01]/g, '')); setEncoded(''); setEncodedDNA(''); setDecoded(''); setMaxRun(0); setError('') }}
            placeholder="Type binary here..."
          />
        </div>

        <div className="action-row">
          <button className="btn-primary" onClick={handleEncode} disabled={loading !== null}>
            {loading === 'encode' ? <span className="spinner" /> : 'Encode'}
          </button>
          <button className="btn-secondary" onClick={handleDecode} disabled={loading !== null || !encodedDNA}>
            {loading === 'decode' ? <span className="spinner" /> : 'Decode'}
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {encodedDNA && (
          <div className="results animate-fade-in">
            <div className="io-section">
              <div className="io-label">
                <span>Encoded DNA Sequence</span>
                {maxRun > 0 && (
                  <span className={`run-badge ${maxRun <= k ? 'ok' : 'bad'}`}>
                    Max run: {maxRun} {maxRun <= k ? '✓' : '✗'}
                  </span>
                )}
              </div>
              <div className="io-box dna-box">
                <code className="mono dna-display">{renderDNA(encodedDNA)}</code>
              </div>
              <div className="io-label secondary">
                <span>Base-4 representation</span>
              </div>
              <div className="io-box base4-box">
                <code className="mono">{encoded}</code>
              </div>
            </div>
          </div>
        )}

        {decoded && (
          <div className="results animate-fade-in">
            <div className="io-section">
              <div className="io-label">
                <span>Decoded Binary</span>
                <span className={`roundtrip-badge ${roundTripOk ? 'ok' : 'bad'}`}>
                  {roundTripOk ? 'Round-trip verified ✓' : 'Mismatch ✗'}
                </span>
              </div>
              <div className="io-box output-box">
                <code className="mono">{renderBits(decoded)}</code>
              </div>
            </div>
          </div>
        )}

        <div className="base-legend">
          {Object.entries(BASE_NAMES).map(([base, name]) => (
            <div key={base} className="base-legend-item">
              <span className={`base-legend-letter ${BASE_COLORS[base]}`}>{base}</span>
              <span className="base-legend-name">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
