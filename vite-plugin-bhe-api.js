import { execFile, execFileSync } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync, chmodSync, statSync } from 'node:fs'

const execFileAsync = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))

const BHE_BRIDGE = join(__dirname, 'bhe_bridge')
const BHE_RATES = join(__dirname, 'bhe_rates')
const BHE_BENCHMARK = join(__dirname, 'bounded_homopolymer')

function isExecutable(filePath) {
  try {
    const stat = statSync(filePath)
    return (stat.mode & 0o111) !== 0
  } catch {
    return false
  }
}

function ensureBinary(binaryPath, sourceFile, extraFlags = '') {
  if (existsSync(binaryPath) && isExecutable(binaryPath)) {
    return
  }
  if (!existsSync(binaryPath)) {
    chmodSync(binaryPath, 0o755)
    if (isExecutable(binaryPath)) return
  }
  const cmd = `g++ -O3 ${sourceFile} -lgmpxx -lgmp -o ${binaryPath}`
  console.log(`[bhe-api] Compiling ${binaryPath}...`)
  execFileSync('g++', ['-O3', sourceFile, '-lgmpxx', '-lgmp', '-o', binaryPath], {
    stdio: 'pipe',
    cwd: __dirname,
  })
  chmodSync(binaryPath, 0o755)
  console.log(`[bhe-api] Compiled ${binaryPath}`)
}

function ensureAllBinaries() {
  try {
    ensureBinary(BHE_BRIDGE, 'bhe_bridge.cpp')
    ensureBinary(BHE_RATES, 'BHE_rates.cpp')
    ensureBinary(BHE_BENCHMARK, 'BoundedHomopolymerEncoding.cpp')
  } catch (err) {
    console.error('[bhe-api] Failed to compile binaries:', err.message)
  }
}

const BASE_MAP = { '0': 'A', '1': 'C', '2': 'G', '3': 'T' }

function base4ToDNA(s) {
  return s.split('').map(c => BASE_MAP[c] || c).join('')
}

function dnaToBase4(s) {
  const map = { A: '0', C: '1', G: '2', T: '3', a: '0', c: '1', g: '2', t: '3' }
  return s.split('').map(c => map[c] ?? c).join('')
}

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      if (!data) { resolve({}); return }
      try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

function sendJSON(res, status, body) {
  const json = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
  })
  res.end(json)
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/encode' && req.method === 'POST') {
    try {
      const body = await parseJSONBody(req)
      const { k, encoding_length, input_data_length, input } = body
      if (typeof k !== 'number' || typeof encoding_length !== 'number' || typeof input_data_length !== 'number' || typeof input !== 'string') {
        sendJSON(res, 400, { error: 'Missing or invalid parameters' })
        return
      }
      const { stdout } = await execFileAsync(BHE_BRIDGE, [
        'encode', String(k), String(encoding_length), String(input_data_length), input,
      ], { timeout: 30000 })
      const encoded = stdout.trim()
      if (encoded.startsWith('ERROR')) {
        sendJSON(res, 400, { error: encoded })
        return
      }
      sendJSON(res, 200, { encoded, dna: base4ToDNA(encoded) })
    } catch (err) {
      const msg = err.stderr?.trim() || err.message || 'Unknown error'
      sendJSON(res, 500, { error: msg })
    }
    return true
  }

  if (url.pathname === '/api/decode' && req.method === 'POST') {
    try {
      const body = await parseJSONBody(req)
      const { k, encoding_length, input_data_length, encoded } = body
      if (typeof k !== 'number' || typeof encoding_length !== 'number' || typeof input_data_length !== 'number' || typeof encoded !== 'string') {
        sendJSON(res, 400, { error: 'Missing or invalid parameters' })
        return
      }
      const base4 = dnaToBase4(encoded)
      const { stdout } = await execFileAsync(BHE_BRIDGE, [
        'decode', String(k), String(encoding_length), String(input_data_length), base4,
      ], { timeout: 30000 })
      const decoded = stdout.trim()
      if (decoded.startsWith('ERROR')) {
        sendJSON(res, 400, { error: decoded })
        return
      }
      sendJSON(res, 200, { decoded })
    } catch (err) {
      const msg = err.stderr?.trim() || err.message || 'Unknown error'
      sendJSON(res, 500, { error: msg })
    }
    return true
  }

  if (url.pathname === '/api/rates' && req.method === 'GET') {
    try {
      const encodingLength = parseInt(url.searchParams.get('encoding_length') || '96', 10)
      if (!encodingLength || encodingLength <= 0) {
        sendJSON(res, 400, { error: 'Invalid encoding_length' })
        return
      }
      const { stdout } = await execFileAsync(BHE_RATES, [String(encodingLength)], { timeout: 30000 })
      const lines = stdout.trim().split('\n')
      const results = []
      for (const line of lines) {
        const m = line.match(/^\s*(\d+)\s+(\d+)\s+([\d.]+)\s*$/)
        if (m) {
          results.push({
            k: parseInt(m[1], 10),
            max_input_bits: parseInt(m[2], 10),
            rate: parseFloat(m[3]),
          })
        }
      }
      sendJSON(res, 200, { encoding_length: encodingLength, results })
    } catch (err) {
      const msg = err.stderr?.trim() || err.message || 'Unknown error'
      sendJSON(res, 500, { error: msg })
    }
    return true
  }

  if (url.pathname === '/api/benchmark' && req.method === 'POST') {
    try {
      const body = await parseJSONBody(req)
      const { k, encoding_length, input_data_length, number_trials } = body
      if (typeof k !== 'number' || typeof encoding_length !== 'number' || typeof input_data_length !== 'number' || typeof number_trials !== 'number') {
        sendJSON(res, 400, { error: 'Missing or invalid parameters' })
        return
      }
      const { stdout, stderr } = await execFileAsync(BHE_BENCHMARK, [
        String(k), String(encoding_length), String(input_data_length), String(number_trials),
      ], { timeout: 60000 })
      sendJSON(res, 200, { output: stdout, stderr })
    } catch (err) {
      const msg = err.stderr?.trim() || err.message || 'Unknown error'
      sendJSON(res, 500, { error: msg })
    }
    return true
  }

  if (url.pathname === '/api/health' && req.method === 'GET') {
    sendJSON(res, 200, { status: 'ok' })
    return true
  }

  return false
}

export function createBheApiPlugin() {
  return {
    name: 'bhe-api',
    configureServer(server) {
      ensureAllBinaries()
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          next()
          return
        }
        const url = new URL(req.url, `http://${req.headers.host}`)
        const handled = await handleApi(req, res, url)
        if (!handled) {
          sendJSON(res, 404, { error: 'Not found' })
        }
      })
    },
    configurePreviewServer(server) {
      ensureAllBinaries()
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          next()
          return
        }
        const url = new URL(req.url, `http://${req.headers.host}`)
        const handled = await handleApi(req, res, url)
        if (!handled) {
          sendJSON(res, 404, { error: 'Not found' })
        }
      })
    },
  }
}
