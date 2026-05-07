import React, { useState } from 'react';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const BUSINESS_TYPES = [
  { value: '', label: 'Select business type' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'trading', label: 'Trading' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
];

const initialForm = {
  ownerName: '',
  pan: '',
  businessType: '',
  monthlyRevenue: '',
  loanAmount: '',
  tenureMonths: '',
  loanPurpose: '',
};

const validate = (form) => {
  const errs = {};
  if (!form.ownerName.trim()) errs.ownerName = 'Owner name is required';
  else if (form.ownerName.trim().length < 2) errs.ownerName = 'Name too short';

  const pan = form.pan.trim().toUpperCase();
  if (!pan) errs.pan = 'PAN is required';
  else if (!PAN_REGEX.test(pan)) errs.pan = 'Invalid PAN format (e.g. ABCDE1234F)';

  if (!form.businessType) errs.businessType = 'Business type is required';

  const rev = parseFloat(form.monthlyRevenue);
  if (!form.monthlyRevenue) errs.monthlyRevenue = 'Monthly revenue is required';
  else if (isNaN(rev) || rev <= 0) errs.monthlyRevenue = 'Must be a positive number';

  const loan = parseFloat(form.loanAmount);
  if (!form.loanAmount) errs.loanAmount = 'Loan amount is required';
  else if (isNaN(loan) || loan <= 0) errs.loanAmount = 'Must be a positive number';

  const tenure = parseInt(form.tenureMonths);
  if (!form.tenureMonths) errs.tenureMonths = 'Tenure is required';
  else if (isNaN(tenure) || tenure < 1) errs.tenureMonths = 'Must be at least 1 month';
  else if (tenure > 360) errs.tenureMonths = 'Max 360 months';

  if (!form.loanPurpose.trim()) errs.loanPurpose = 'Loan purpose is required';
  else if (form.loanPurpose.trim().length < 3) errs.loanPurpose = 'Too short';

  return errs;
};

const ApplicationForm = ({ onResult, isLoading, onSubmit }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const set = (field) => (e) => {
    const val = field === 'pan' ? e.target.value.toUpperCase() : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
    if (touched[field]) {
      const errs = validate({ ...form, [field]: val });
      setErrors(prev => ({ ...prev, [field]: errs[field] }));
    }
  };

  const blur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validate(form);
    setErrors(prev => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(initialForm).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({
      ownerName: form.ownerName.trim(),
      pan: form.pan.trim().toUpperCase(),
      businessType: form.businessType,
      monthlyRevenue: parseFloat(form.monthlyRevenue),
      loanAmount: parseFloat(form.loanAmount),
      tenureMonths: parseInt(form.tenureMonths),
      loanPurpose: form.loanPurpose.trim(),
    });
  };

  const F = ({ name, label, children }) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {touched[name] && errors[name] && (
        <span className="field-error">⚠ {errors[name]}</span>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Business Profile */}
      <div className="card">
        <div className="card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          Business Profile
        </div>
        <div className="form-grid">
          <F name="ownerName" label="Owner / Proprietor Name">
            <input
              id="ownerName"
              type="text"
              value={form.ownerName}
              onChange={set('ownerName')}
              onBlur={blur('ownerName')}
              placeholder="Rajan Mehta"
            />
          </F>
          <F name="pan" label="PAN Number">
            <input
              id="pan"
              type="text"
              value={form.pan}
              onChange={set('pan')}
              onBlur={blur('pan')}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </F>
          <F name="businessType" label="Business Type">
            <select
              id="businessType"
              value={form.businessType}
              onChange={set('businessType')}
              onBlur={blur('businessType')}
            >
              {BUSINESS_TYPES.map(o => (
                <option key={o.value} value={o.value} disabled={o.value === ''}>
                  {o.label}
                </option>
              ))}
            </select>
          </F>
          <F name="monthlyRevenue" label="Monthly Revenue (₹)">
            <input
              id="monthlyRevenue"
              type="number"
              min="1"
              value={form.monthlyRevenue}
              onChange={set('monthlyRevenue')}
              onBlur={blur('monthlyRevenue')}
              placeholder="500000"
            />
          </F>
        </div>
      </div>

      {/* Loan Details */}
      <div className="card">
        <div className="card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Loan Details
        </div>
        <div className="form-grid">
          <F name="loanAmount" label="Loan Amount (₹)">
            <input
              id="loanAmount"
              type="number"
              min="1"
              value={form.loanAmount}
              onChange={set('loanAmount')}
              onBlur={blur('loanAmount')}
              placeholder="2500000"
            />
          </F>
          <F name="tenureMonths" label="Tenure (Months)">
            <input
              id="tenureMonths"
              type="number"
              min="1"
              max="360"
              value={form.tenureMonths}
              onChange={set('tenureMonths')}
              onBlur={blur('tenureMonths')}
              placeholder="24"
            />
          </F>
          <F name="loanPurpose" label="Purpose of Loan">
            <input
              id="loanPurpose"
              type="text"
              value={form.loanPurpose}
              onChange={set('loanPurpose')}
              onBlur={blur('loanPurpose')}
              placeholder="Working capital expansion, equipment purchase…"
              className="field.span-2"
            />
          </F>
        </div>
      </div>

      <button
        type="submit"
        className={`btn-submit ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? 'Analysing Application…' : 'Get Lending Decision →'}
      </button>
    </form>
  );
};

export default ApplicationForm;
