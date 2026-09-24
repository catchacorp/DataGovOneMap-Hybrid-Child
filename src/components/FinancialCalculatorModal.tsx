import React, { useState, useMemo } from 'react';
import { HDBTransaction, formatCurrencySGD } from '../data/hdbData';
import {
  Calculator,
  X,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  DollarSign,
  PieChart,
} from 'lucide-react';

interface FinancialCalculatorModalProps {
  property: HDBTransaction;
  onClose: () => void;
}

export const FinancialCalculatorModal: React.FC<FinancialCalculatorModalProps> = ({
  property,
  onClose,
}) => {
  // Inputs
  const [buyerType, setBuyerType] = useState<'couple' | 'single'>('couple');
  const [isFirstTimer, setIsFirstTimer] = useState<boolean>(true);
  const [householdIncome, setHouseholdIncome] = useState<number>(7500);
  const [livesNearParents, setLivesNearParents] = useState<'none' | 'within_4km' | 'with_parents'>('within_4km');
  const [loanType, setLoanType] = useState<'hdb' | 'bank'>('hdb');
  const [loanTenureYears, setLoanTenureYears] = useState<number>(25);
  const [interestRate, setInterestRate] = useState<number>(2.6); // 2.6% for HDB

  // Sync default interest rate when loan type switches
  const handleLoanTypeChange = (type: 'hdb' | 'bank') => {
    setLoanType(type);
    if (type === 'hdb') {
      setInterestRate(2.6);
      if (loanTenureYears > 25) setLoanTenureYears(25);
    } else {
      setInterestRate(3.0);
    }
  };

  // Grant Calculations
  const calculatedGrants = useMemo(() => {
    let ehg = 0;
    let phg = 0;
    let familyGrant = 0;

    if (isFirstTimer) {
      if (buyerType === 'couple') {
        // Enhanced CPF Housing Grant (EHG) (Up to $80k based on income ceiling $9k)
        if (householdIncome <= 1500) ehg = 80000;
        else if (householdIncome <= 2000) ehg = 75000;
        else if (householdIncome <= 3000) ehg = 65000;
        else if (householdIncome <= 4000) ehg = 55000;
        else if (householdIncome <= 5000) ehg = 45000;
        else if (householdIncome <= 6000) ehg = 35000;
        else if (householdIncome <= 7000) ehg = 25000;
        else if (householdIncome <= 8000) ehg = 15000;
        else if (householdIncome <= 9000) ehg = 5000;
        else ehg = 0;

        // Family Grant
        if (householdIncome <= 14000) {
          if (property.flat_type === '2 ROOM' || property.flat_type === '3 ROOM' || property.flat_type === '4 ROOM') {
            familyGrant = 80000; // Revised Family Grant for 2-4 room resale
          } else {
            familyGrant = 50000; // 5-room and above
          }
        }
      } else {
        // Singles grant
        if (householdIncome <= 4500) {
          ehg = Math.max(0, 40000 - Math.floor(householdIncome / 500) * 2500);
        }
        if (householdIncome <= 7000) {
          familyGrant = property.flat_type === '4 ROOM' || property.flat_type === '5 ROOM' ? 25000 : 40000;
        }
      }

      // Proximity Housing Grant (PHG)
      if (livesNearParents === 'within_4km') {
        phg = buyerType === 'couple' ? 20000 : 10000;
      } else if (livesNearParents === 'with_parents') {
        phg = buyerType === 'couple' ? 30000 : 15000;
      }
    }

    const totalGrants = ehg + phg + familyGrant;
    return { ehg, phg, familyGrant, totalGrants };
  }, [buyerType, isFirstTimer, householdIncome, livesNearParents, property.flat_type]);

  // Mortgage Calculations
  const mortgageDetails = useMemo(() => {
    const purchasePrice = property.price;
    const totalGrants = calculatedGrants.totalGrants;

    // LTV (Loan-to-Value)
    // HDB Concessionary Loan: up to 80% LTV
    // Bank Loan: up to 75% LTV
    const maxLtvPercent = loanType === 'hdb' ? 0.8 : 0.75;
    const minDownpaymentPercent = 1 - maxLtvPercent;

    const baseDownpayment = purchasePrice * minDownpaymentPercent;
    // Grants can offset downpayment / purchase price
    const netPurchasePrice = Math.max(0, purchasePrice - totalGrants);

    const maxLoanAmount = purchasePrice * maxLtvPercent;
    const loanAmount = Math.min(maxLoanAmount, netPurchasePrice);

    // Monthly installment using amortization formula
    // M = P * [ r(1+r)^n ] / [ (1+r)^n – 1]
    const monthlyRate = interestRate / 100 / 12;
    const numMonths = loanTenureYears * 12;

    let monthlyInstallment = 0;
    if (loanAmount > 0 && monthlyRate > 0) {
      monthlyInstallment =
        (loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, numMonths))) /
        (Math.pow(1 + monthlyRate, numMonths) - 1);
    }

    const totalPayment = monthlyInstallment * numMonths;
    const totalInterest = Math.max(0, totalPayment - loanAmount);

    // Mortgage Servicing Ratio (MSR): monthly installment / household income (capped at 30% for HDB)
    const msrPercent = householdIncome > 0 ? (monthlyInstallment / householdIncome) * 100 : 0;
    const isMsrCompliant = msrPercent <= 30;

    return {
      purchasePrice,
      totalGrants,
      netPurchasePrice,
      baseDownpayment,
      loanAmount,
      monthlyInstallment,
      totalInterest,
      msrPercent,
      isMsrCompliant,
    };
  }, [property.price, calculatedGrants, loanType, loanTenureYears, interestRate, householdIncome]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                CPF Housing Grants & Mortgage Estimator
              </h3>
              <p className="text-xs text-slate-400">
                Blk {property.block} {property.street} ({property.flat_type}) • {formatCurrencySGD(property.price)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* Buyer Profile Options */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Buyer Eligibility Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Applicant Status</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-200/80 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setBuyerType('couple')}
                    className={`py-1 rounded font-semibold transition ${
                      buyerType === 'couple' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Family / Couple
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuyerType('single')}
                    className={`py-1 rounded font-semibold transition ${
                      buyerType === 'single' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Single (≥35)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Gross Household Income (Monthly)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-semibold">$</span>
                  <input
                    type="number"
                    step="500"
                    min="1000"
                    max="30000"
                    value={householdIncome}
                    onChange={(e) => setHouseholdIncome(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">First-Timer Status</label>
                <select
                  value={isFirstTimer ? 'yes' : 'no'}
                  onChange={(e) => setIsFirstTimer(e.target.value === 'yes')}
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="yes">First-Timer Applicants (Eligible for grants)</option>
                  <option value="no">Second-Timer (Resale Levy may apply)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Proximity to Parents / Married Child</label>
                <select
                  value={livesNearParents}
                  onChange={(e) => setLivesNearParents(e.target.value as any)}
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="within_4km">Within 4km of parents (PHG $20,000)</option>
                  <option value="with_parents">Living together with parents (PHG $30,000)</option>
                  <option value="none">Not living near parents ($0 PHG)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CPF Housing Grants Breakdown Box */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Estimated CPF Housing Grants
                </h4>
              </div>
              <span className="text-base font-extrabold text-emerald-700">
                {formatCurrencySGD(calculatedGrants.totalGrants)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Enhanced CPF Grant (EHG)</span>
                <span className="font-bold text-slate-800">{formatCurrencySGD(calculatedGrants.ehg)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Proximity Grant (PHG)</span>
                <span className="font-bold text-slate-800">{formatCurrencySGD(calculatedGrants.phg)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Family / CPF Grant</span>
                <span className="font-bold text-slate-800">{formatCurrencySGD(calculatedGrants.familyGrant)}</span>
              </div>
            </div>
          </div>

          {/* Loan Configuration */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Financing & Mortgage Options
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Financing Type</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-200/80 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleLoanTypeChange('hdb')}
                    className={`py-1 rounded font-semibold transition ${
                      loanType === 'hdb' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    HDB (80% LTV)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoanTypeChange('bank')}
                    className={`py-1 rounded font-semibold transition ${
                      loanType === 'bank' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Bank (75% LTV)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Loan Tenure</label>
                <select
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={25}>25 Years (HDB Max)</option>
                  {loanType === 'bank' && <option value={30}>30 Years (Bank Max)</option>}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="8"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Monthly Repayment Breakdown */}
          <div className="bg-indigo-900 text-white rounded-xl p-5 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs text-indigo-300 uppercase font-semibold tracking-wider">
                  Estimated Monthly Installment
                </span>
                <div className="text-3xl font-extrabold text-white mt-1">
                  {formatCurrencySGD(mortgageDetails.monthlyInstallment)}
                  <span className="text-xs font-normal text-indigo-200"> / month</span>
                </div>
                <div className="text-xs text-indigo-200 mt-1">
                  Can be paid via CPF Ordinary Account (OA) savings + monthly contributions
                </div>
              </div>

              {/* MSR Warning / Pass Check */}
              <div
                className={`p-3 rounded-lg border text-xs max-w-xs ${
                  mortgageDetails.isMsrCompliant
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  MSR: {mortgageDetails.msrPercent.toFixed(1)}% (Limit: 30%)
                </div>
                <div className="text-[11px] mt-0.5 opacity-90">
                  {mortgageDetails.isMsrCompliant
                    ? 'Within the mandatory 30% HDB Mortgage Servicing Ratio limit.'
                    : 'Exceeds 30% MSR limit! Consider larger downpayment or extending tenure.'}
                </div>
              </div>
            </div>

            {/* Numerical breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-indigo-800 text-xs">
              <div>
                <span className="text-indigo-300 text-[10px] block">Property Price</span>
                <span className="font-bold">{formatCurrencySGD(property.price)}</span>
              </div>
              <div>
                <span className="text-indigo-300 text-[10px] block">Net Price After Grants</span>
                <span className="font-bold">{formatCurrencySGD(mortgageDetails.netPurchasePrice)}</span>
              </div>
              <div>
                <span className="text-indigo-300 text-[10px] block">Loan Principal</span>
                <span className="font-bold">{formatCurrencySGD(mortgageDetails.loanAmount)}</span>
              </div>
              <div>
                <span className="text-indigo-300 text-[10px] block">Total Loan Interest</span>
                <span className="font-bold">{formatCurrencySGD(mortgageDetails.totalInterest)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>CPF & HDB rules updated as of 2026 guidelines.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
