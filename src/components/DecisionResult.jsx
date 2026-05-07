import React from 'react';
import ScoreRing from './ScoreRing';

const POSITIVE_CODES = new Set([
  'HEALTHY_FINANCIALS', 'STRONG_REPAYMENT_CAPACITY',
  'LOW_CREDIT_RISK', 'CONSERVATIVE_LOAN_REQUEST', 'ELIGIBLE',
]);

const NEGATIVE_CODES = new Set([
  'LOW_REVENUE_TO_EMI', 'CANNOT_SERVICE_EMI', 'EXCESSIVE_LOAN_AMOUNT',
  'HIGH_LOAN_RATIO', 'ZERO_OR_NEGATIVE_REVENUE', 'DATA_INCONSISTENCY',
  'TENURE_TOO_SHORT', 'TENURE_TOO_LONG', 'INSUFFICIENT_CREDITWORTHINESS',
]);

const getTagClass = (code) => {
  if (POSITIVE_CODES.has(code)) return 'reason-tag positive';
  if (NEGATIVE_CODES.has(code)) return 'reason-tag negative';
  return 'reason-tag neutral';
};

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const DecisionResult = ({ result, onReset }) => {
  const approved = result.decision === 'APPROVED';

  return (
    <div className="result-panel">
      {/* Decision Banner */}
      <div className={`decision-banner ${approved ? 'approved' : 'rejected'}`}>
        <span className="decision-icon">{approved ? '✅' : '❌'}</span>
        <div className="decision-label">{approved ? 'Loan Approved' : 'Loan Rejected'}</div>
        <div className="decision-appid">{result.applicationId}</div>
      </div>

      {/* Score + Metrics */}
      <div className="card">
        <div className="card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Credit Assessment
        </div>

        <div className="score-section">
          <ScoreRing score={result.creditScore} approved={approved} />
          <div className="score-info">
            <h3>{approved ? 'Creditworthy Profile' : 'Below Credit Threshold'}</h3>
            <p>
              Score range: 300–900 &nbsp;·&nbsp; Approval threshold: 600<br />
              {approved
                ? 'Your financials meet our lending criteria.'
                : 'Your profile did not meet the minimum requirements.'}
            </p>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-tile">
            <div className="m-label">EMI Estimate</div>
            <div className="m-value" style={{ fontSize: '14px' }}>
              {formatCurrency(result.details?.emiEstimate || 0)}/mo
            </div>
          </div>
          <div className="metric-tile">
            <div className="m-label">Revenue : EMI</div>
            <div className="m-value">
              {result.details?.revenueToEMIRatio?.toFixed(2)}x
            </div>
          </div>
          <div className="metric-tile">
            <div className="m-label">Loan : Revenue</div>
            <div className="m-value">
              {result.details?.loanToRevenueRatio?.toFixed(2)}x
            </div>
          </div>
        </div>
      </div>

      {/* Reason Codes */}
      <div className="card">
        <div className="card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Decision Signals
        </div>
        <div className="reason-codes">
          {result.reasonCodes?.map((code) => (
            <span key={code} className={getTagClass(code)}>{code}</span>
          ))}
        </div>
      </div>

      <button className="btn-secondary" onClick={onReset}>
        ← Submit Another Application
      </button>
    </div>
  );
};

export default DecisionResult;
