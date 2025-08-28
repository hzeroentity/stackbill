'use client'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'SEK' | 'NOK' | 'DKK'

export const SUPPORTED_CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { value: 'SEK', label: 'Swedish Krona', symbol: 'SEK' },
  { value: 'NOK', label: 'Norwegian Krona', symbol: 'NOK' },
  { value: 'DKK', label: 'Danish Krona', symbol: 'DKK' },
]

const CURRENCY_PREFERENCE_KEY = 'stackbill_currency_preference'

export function getDefaultCurrency(): Currency {
  if (typeof window === 'undefined') return 'USD'
  
  const saved = localStorage.getItem(CURRENCY_PREFERENCE_KEY)
  if (saved && SUPPORTED_CURRENCIES.find(c => c.value === saved)) {
    return saved as Currency
  }
  
  return 'USD'
}

export function setDefaultCurrency(currency: Currency): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(CURRENCY_PREFERENCE_KEY, currency)
}

export function getCurrencySymbol(currency: string): string {
  const currencyData = SUPPORTED_CURRENCIES.find(c => c.value === currency)
  return currencyData?.symbol || currency
}

export function formatCurrencyWithPreferredRate(
  amount: number, 
  originalCurrency: string, 
  preferredCurrency?: Currency
): string {
  const targetCurrency = preferredCurrency || getDefaultCurrency()
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: originalCurrency || targetCurrency,
  }).format(amount)
}

export async function convertAndFormatCurrency(
  amount: number,
  originalCurrency: string,
  targetCurrency?: Currency
): Promise<string> {
  const target = targetCurrency || getDefaultCurrency()
  
  // Import dynamically to avoid circular dependencies
  const { ExchangeRateService } = await import('./exchange-rates')
  
  try {
    const convertedAmount = await ExchangeRateService.convertAmount(
      amount,
      originalCurrency as Currency,
      target
    )
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: target,
    }).format(convertedAmount)
  } catch (error) {
    console.error('Currency conversion failed:', error)
    // Fallback to original currency formatting
    return formatCurrencyWithPreferredRate(amount, originalCurrency, target)
  }
}