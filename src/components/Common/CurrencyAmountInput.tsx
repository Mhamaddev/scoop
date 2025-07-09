import React, { forwardRef, useEffect, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { convertToIQD, formatCurrency, getLatestExchangeRate, CurrencyConversion } from '../../utils/currency';
import Input from './Input';
import Select from './Select';

interface CurrencyAmountInputProps {
  label: string;
  amount: string;
  currency: 'USD' | 'IQD';
  entryDate: string;
  onAmountChange: (amount: string) => void;
  onCurrencyChange: (currency: 'USD' | 'IQD') => void;
  onConversionChange?: (conversion: CurrencyConversion) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  amountRef?: React.RefObject<HTMLInputElement>;
  currencyRef?: React.RefObject<HTMLSelectElement>;
  onAmountKeyDown?: (e: React.KeyboardEvent) => void;
  onCurrencyKeyDown?: (e: React.KeyboardEvent) => void;
}

const CurrencyAmountInput: React.FC<CurrencyAmountInputProps> = ({
  label,
  amount,
  currency,
  entryDate,
  onAmountChange,
  onCurrencyChange,
  onConversionChange,
  placeholder = "Enter amount",
  disabled = false,
  required = false,
  className = "",
  amountRef,
  currencyRef,
  onAmountKeyDown,
  onCurrencyKeyDown
}) => {
  const { dollarRates } = useData();
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null);
  const [rateWarning, setRateWarning] = useState<string>('');

  // Calculate conversion whenever amount, currency, or entry date changes
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      setConversion(null);
      setRateWarning('');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      setConversion(null);
      setRateWarning('');
      return;
    }

    const conversionResult = convertToIQD(numericAmount, currency, {
      entryDate,
      dollarRates
    });

    setConversion(conversionResult);
    onConversionChange?.(conversionResult);

    // Set warning if USD conversion but no rate available
    if (currency === 'USD' && dollarRates.length === 0) {
      setRateWarning('No exchange rates available. Please add daily rates first.');
    } else if (currency === 'USD' && conversionResult.exchangeRate === 1) {
      setRateWarning('No exchange rate found for this date. Using 1:1 ratio.');
    } else if (currency === 'USD' && conversionResult.rateDate !== entryDate) {
      setRateWarning(`Using rate from ${conversionResult.rateDate} (nearest available)`);
    } else {
      setRateWarning('');
    }
  }, [amount, currency, entryDate, dollarRates, onConversionChange]);

  const latestRate = getLatestExchangeRate(dollarRates);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        <Input
          ref={amountRef}
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          onKeyDown={onAmountKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />
        
        <Select
          ref={currencyRef}
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as 'USD' | 'IQD')}
          onKeyDown={onCurrencyKeyDown}
          disabled={disabled}
          options={[
            { value: 'IQD', label: 'IQD (Iraqi Dinar)' },
            { value: 'USD', label: 'USD (US Dollar)' }
          ]}
        />
      </div>

      {/* Conversion Display */}
      {conversion && currency === 'USD' && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 dark:text-blue-300">
              USD to IQD Conversion:
            </span>
            <span className="font-medium text-blue-800 dark:text-blue-200">
              {formatCurrency(conversion.convertedAmount, 'IQD')}
            </span>
          </div>
          
          {conversion.exchangeRate && conversion.exchangeRate > 1 && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Rate: 1 USD = {conversion.exchangeRate} IQD
              {conversion.rateDate && ` (${conversion.rateDate})`}
            </div>
          )}
        </div>
      )}

      {/* Warning Messages */}
      {rateWarning && (
        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-700">
          <div className="text-xs text-amber-700 dark:text-amber-300">
            ⚠️ {rateWarning}
          </div>
        </div>
      )}

      {/* Latest Rate Info */}
      {currency === 'USD' && latestRate && !rateWarning && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Latest rate: 1 USD = {latestRate.rate} IQD ({latestRate.date})
        </div>
      )}

      {/* No rates available warning */}
      {currency === 'USD' && !latestRate && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-700">
          <div className="text-xs text-red-700 dark:text-red-300">
            ❌ No exchange rates available. Please add daily rates in the Accounting module first.
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyAmountInput; 