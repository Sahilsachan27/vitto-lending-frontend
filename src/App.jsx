import React, { useState } from 'react';
import ApplicationForm from './components/ApplicationForm';
import DecisionResult from './components/DecisionResult';
import { submitApplication } from './utils/api';

function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await submitApplication(formData);
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.details?.[0]?.message || 'Submission failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="logo">
              <div className="logo-mark">V</div>
              <div className="logo-text">vitto<span>.</span></div>
            </div>
            <span className="header-badge">MSME Lending</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main>
        <div className="container">
          {!result && (
            <section className="hero">
              <div className="hero-tag">⚡ Instant Credit Decision</div>
              <h1>
                Get Your <span className="accent">Loan Decision</span><br />
                in Seconds
              </h1>
              <p>
                Fill in your business profile and loan requirements.
                Our engine evaluates creditworthiness and returns a structured decision instantly.
              </p>
            </section>
          )}

          {error && (
            <div className="error-box">
              ⚠ {error}
            </div>
          )}

          {result ? (
            <DecisionResult result={result} onReset={handleReset} />
          ) : (
            <ApplicationForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} Vitto · Uthaan Technologies Pvt Ltd · Assessment Build
          <br></br>
          By Sahil Sachan
        </div>
      </footer>
    </div>
  );
}

export default App;
