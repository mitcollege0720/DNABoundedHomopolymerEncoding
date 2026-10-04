export interface EncodeResponse {
  encoded: string;
  dna: string;
  error?: string;
}

export interface DecodeResponse {
  decoded: string;
  error?: string;
}

export interface RateResult {
  k: number;
  max_input_bits: number;
  rate: number;
}

export interface RatesResponse {
  encoding_length: number;
  results: RateResult[];
  error?: string;
}

export interface BenchmarkResponse {
  output: string;
  stderr: string;
  error?: string;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function encode(k: number, encoding_length: number, input_data_length: number, input: string): Promise<EncodeResponse> {
  return postJSON<EncodeResponse>('/api/encode', { k, encoding_length, input_data_length, input });
}

export async function decode(k: number, encoding_length: number, input_data_length: number, encoded: string): Promise<DecodeResponse> {
  return postJSON<DecodeResponse>('/api/decode', { k, encoding_length, input_data_length, encoded });
}

export async function getRates(encoding_length: number): Promise<RatesResponse> {
  const res = await fetch(`/api/rates?encoding_length=${encoding_length}`);
  return res.json();
}

export async function benchmark(k: number, encoding_length: number, input_data_length: number, number_trials: number): Promise<BenchmarkResponse> {
  return postJSON<BenchmarkResponse>('/api/benchmark', { k, encoding_length, input_data_length, number_trials });
}
