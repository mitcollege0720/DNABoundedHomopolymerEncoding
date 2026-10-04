export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
              <path d="M20 8 Q32 20 20 32 Q8 44 20 56" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round"/>
              <path d="M44 8 Q32 20 44 32 Q56 44 44 56" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span>DNA Bounded Homopolymer Encoding</span>
          </div>
          <p className="footer-desc">
            A codec from Microsoft Research for converting binary strings into DNA-like
            sequences with bounded homopolymer runs. Built for the DNA Storage Project.
          </p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Resources</h4>
            <a href="https://github.com/microsoft/DNABoundedHomopolymerEncoding" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
            <a href="https://github.com/microsoft/DNABoundedHomopolymerEncoding/blob/main/BoundedHomopolymerEncoding.pdf" target="_blank" rel="noopener noreferrer">Algorithm Writeup</a>
            <a href="https://www.microsoft.com/en-us/research/project/dna-storage/" target="_blank" rel="noopener noreferrer">DNA Storage Project</a>
          </div>
          <div className="footer-col">
            <h4>Project</h4>
            <a href="https://opensource.microsoft.com/codeofconduct/" target="_blank" rel="noopener noreferrer">Code of Conduct</a>
            <a href="https://cla.opensource.microsoft.com" target="_blank" rel="noopener noreferrer">CLA</a>
            <a href="https://aka.ms/SECURITY.md" target="_blank" rel="noopener noreferrer">Security</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>MIT License · Copyright (c) Microsoft Corporation</span>
      </div>
    </footer>
  )
}
