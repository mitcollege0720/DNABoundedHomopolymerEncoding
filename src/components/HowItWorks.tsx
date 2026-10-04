export default function HowItWorks() {
  return (
    <div className="how-it-works animate-fade-in-up">
      <div className="card">
        <h2 className="card-title">How It Works</h2>
        <p className="card-subtitle">The algorithm behind bounded homopolymer encoding for DNA storage</p>

        <div className="how-section">
          <div className="how-number">1</div>
          <div className="how-content">
            <h3>The Problem</h3>
            <p>
              DNA synthesis and sequencing are sensitive to long runs of identical bases (homopolymers)
              like <code className="mono base-A">AAA</code> or <code className="mono base-G">GGG</code>.
              These runs cause insertion and deletion errors during reading. By bounding the maximum
              homopolymer length to <span className="mono">k</span>, stored strands become more robust.
            </p>
          </div>
        </div>

        <div className="how-section">
          <div className="how-number">2</div>
          <div className="how-content">
            <h3>Finite State Machine</h3>
            <p>
              The encoder models the constraint as a finite state machine (FSM). Each state tracks the
              current run length of the last output symbol. A transition is allowed only if it doesn't
              violate the <span className="mono">k</span>-bound. Invalid transitions are marked as
              <span className="mono"> -1</span>.
            </p>
            <div className="fsm-viz">
              <div className="fsm-state">State 0<br/><span className="fsm-sub">start</span></div>
              <svg width="40" height="20" viewBox="0 0 40 20"><path d="M2 10 L38 10" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#475569"/></marker></defs></svg>
              <div className="fsm-state">State 1<br/><span className="fsm-sub">run=1</span></div>
              <svg width="40" height="20" viewBox="0 0 40 20"><path d="M2 10 L38 10" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow2)"/><defs><marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#475569"/></marker></defs></svg>
              <div className="fsm-state">State 2<br/><span className="fsm-sub">run=2</span></div>
              <svg width="40" height="20" viewBox="0 0 40 20"><path d="M2 10 L38 10" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow3)"/><defs><marker id="arrow3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#475569"/></marker></defs></svg>
              <div className="fsm-state">...<br/><span className="fsm-sub">run=k</span></div>
            </div>
          </div>
        </div>

        <div className="how-section">
          <div className="how-number">3</div>
          <div className="how-content">
            <h3>Counting Paths</h3>
            <p>
              For a strand of length <span className="mono">L</span>, the encoder precomputes
              <code className="mono"> number_paths[t][s]</code> — the number of valid paths of length
              <span className="mono"> t</span> starting from state <span className="mono">s</span>.
              This uses dynamic programming and GMP arbitrary-precision integers, since the counts grow
              exponentially.
            </p>
          </div>
        </div>

        <div className="how-section">
          <div className="how-number">4</div>
          <div className="how-content">
            <h3>Encoding: Find the Nth String</h3>
            <p>
              The binary input is treated as a large integer <span className="mono">N</span>. The encoder
              walks the FSM, and at each step, decides which symbol to emit by comparing
              <span className="mono"> N</span> against the path counts for each branch. This selects the
              <span className="mono">N</span>-th valid string in lexicographic order.
            </p>
          </div>
        </div>

        <div className="how-section">
          <div className="how-number">5</div>
          <div className="how-content">
            <h3>Decoding: Find the Position</h3>
            <p>
              Given an encoded string, the decoder walks the same FSM and sums up the number of paths
              that would have been skipped to reach this particular string. The resulting count
              <span className="mono"> N</span> is converted back to binary — recovering the original
              message exactly.
            </p>
          </div>
        </div>

        <div className="how-section">
          <div className="how-number">6</div>
          <div className="how-content">
            <h3>Special Case: k = 1 (No Homopolymers)</h3>
            <p>
              When <span className="mono">k = 1</span>, no two adjacent symbols can be the same. The
              encoder uses a simpler, faster method: the first two bits select the first base, and the
              remaining bits are converted from base 2 to base 3, with each digit determining the shift
              from the previous base. This is roughly 3× faster than the general case.
            </p>
          </div>
        </div>

        <div className="how-rates">
          <h3>Rate vs. Constraint Trade-off</h3>
          <div className="tradeoff-grid">
            <div className="tradeoff-card strict">
              <div className="tradeoff-k">k = 1</div>
              <div className="tradeoff-desc">No homopolymers at all. Most robust to errors, but lowest rate (~1.58 bits/base).</div>
            </div>
            <div className="tradeoff-card">
              <div className="tradeoff-k">k = 2–3</div>
              <div className="tradeoff-desc">Balanced constraint. Good error resilience with high rate (~1.92–1.98 bits/base).</div>
            </div>
            <div className="tradeoff-card relaxed">
              <div className="tradeoff-k">k = 4–5</div>
              <div className="tradeoff-desc">Relaxed constraint. Near-optimal rate (~1.99 bits/base), but longer runs allowed.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
