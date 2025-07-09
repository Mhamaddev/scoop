import { DollarRate } from '../types';

export interface CurrencyConversion {
  originalAmount: number;
  originalCurrency: 'USD' | 'IQD';
  convertedAmount: number;
  exchangeRate?: number;
  rateDate?: string;
}

export interface ConversionOptions {
  entryDate: string;
  dollarRates: DollarRate[];
}

/**
 * Get the most appropriate exchange rate for a given date
 * Falls back to nearest previous rate if exact date not found
 */
export const getExchangeRateForDate = (
  date: string, 
  dollarRates: DollarRate[]
): { rate: number; rateDate: string } | null => {
  if (!dollarRates.length) return null;

  // Sort rates by date descending
  const sortedRates = [...dollarRates].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const targetDate = new Date(date);

  // First try to find exact match
  const exactMatch = sortedRates.find(rate => rate.date === date);
  if (exactMatch) {
    return { rate: exactMatch.rate, rateDate: exactMatch.date };
  }

  // Find the most recent rate before or on the target date
  const applicableRate = sortedRates.find(rate => 
    new Date(rate.date) <= targetDate
  );

  if (applicableRate) {
    return { rate: applicableRate.rate, rateDate: applicableRate.date };
  }

  // If no rate found before the date, use the oldest available rate
  const oldestRate = sortedRates[sortedRates.length - 1];
  return { rate: oldestRate.rate, rateDate: oldestRate.date };
};

/**
 * Convert amount with currency to IQD
 * If amount is already in IQD, returns as-is
 * If amount is in USD, converts using exchange rate for the entry date
 */
export const convertToIQD = (
  amount: number,
  currency: 'USD' | 'IQD',
  options: ConversionOptions
): CurrencyConversion => {
  if (currency === 'IQD') {
    return {
      originalAmount: amount,
      originalCurrency: 'IQD',
      convertedAmount: amount
    };
  }

  // Convert USD to IQD
  const rateInfo = getExchangeRateForDate(options.entryDate, options.dollarRates);
  
  if (!rateInfo) {
    // No exchange rate available, return as-is with warning
    console.warn(`No exchange rate found for date ${options.entryDate}`);
    return {
      originalAmount: amount,
      originalCurrency: 'USD',
      convertedAmount: amount, // Fallback: treat as 1:1 ratio
      exchangeRate: 1,
      rateDate: options.entryDate
    };
  }

  const convertedAmount = amount * rateInfo.rate;

  return {
    originalAmount: amount,
    originalCurrency: 'USD',
    convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
    exchangeRate: rateInfo.rate,
    rateDate: rateInfo.rateDate
  };
};

export const formatCurrency = (amount: number, currency: 'USD' | 'IQD' = 'IQD'): string => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  } else {
    // Format IQD with proper thousands separators
    return new Intl.NumberFormat('en-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0
    }).format(amount);
  }
};

export const formatIQD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' IQD';
};

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDualCurrency = (iqd: number, usd: number): string => {
  if (usd > 0 && iqd > 0) {
    return `${formatIQD(iqd)} (${formatUSD(usd)})`;
  } else if (usd > 0) {
    return formatUSD(usd);
  } else {
    return formatIQD(iqd);
  }
};

export const convertCurrency = (amount: number, fromCurrency: 'USD' | 'IQD', toCurrency: 'USD' | 'IQD', exchangeRate: number): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  if (fromCurrency === 'USD' && toCurrency === 'IQD') {
    return amount * exchangeRate;
  } else if (fromCurrency === 'IQD' && toCurrency === 'USD') {
    return amount / exchangeRate;
  }
  
  return amount;
};

export const getCurrencySymbol = (currency: 'USD' | 'IQD'): string => {
  return currency === 'USD' ? '$' : 'IQD';
};

/**
 * Format amount in primary currency (IQD) for main displays
 */
export const formatPrimaryCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} IQD`;
};

/**
 * Format secondary currency (USD) for display
 */
export const formatSecondaryCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

/**
 * Format conversion display showing original and converted amounts
 */
export const formatConversionDisplay = (conversion: CurrencyConversion): string => {
  if (conversion.originalCurrency === 'IQD') {
    return formatCurrency(conversion.convertedAmount, 'IQD');
  }

  const originalDisplay = formatCurrency(conversion.originalAmount, 'USD');
  const convertedDisplay = formatCurrency(conversion.convertedAmount, 'IQD');
  const rateDisplay = conversion.exchangeRate 
    ? ` (Rate: 1 USD = ${conversion.exchangeRate} IQD)`
    : '';

  return `${originalDisplay} → ${convertedDisplay}${rateDisplay}`;
};

/**
 * Check if a conversion requires exchange rate data
 */
export const requiresExchangeRate = (currency: 'USD' | 'IQD'): boolean => {
  return currency === 'USD';
};

/**
 * Get the latest exchange rate
 */
export const getLatestExchangeRate = (dollarRates: DollarRate[]): DollarRate | null => {
  if (!dollarRates.length) return null;
  
  return dollarRates.reduce((latest, current) => 
    new Date(current.date) > new Date(latest.date) ? current : latest
  );
}; 