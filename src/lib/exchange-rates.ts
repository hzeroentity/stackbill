'use client'

import { Currency } from './currency-preferences'

interface ExchangeRateResponse {
  base: string
  date: string
  rates: Record<string, number>
}

interface ConversionResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  target_code: string
  conversion_rate: number
  conversion_result: number
}

// Cache for exchange rates (valid for 1 hour)
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const rateCache: Record<string, { rate: number; timestamp: number }> = {}

export class ExchangeRateService {
  private static readonly PRIMARY_URL = 'https://api.exchangerate-api.com/v4/latest'
  private static readonly FALLBACK_URL = 'https://open.er-api.com/v6/latest'

  /**
   * Get exchange rate from source currency to target currency
   */
  static async getExchangeRate(fromCurrency: Currency, toCurrency: Currency): Promise<number> {
    // Same currency = 1:1 rate
    if (fromCurrency === toCurrency) {
      return 1
    }

    const cacheKey = `${fromCurrency}-${toCurrency}`
    const cached = rateCache[cacheKey]

    // Return cached rate if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Using cached rate for ${cacheKey}: ${cached.rate}`)
      }
      return cached.rate
    }

    // Try primary API first, then fallback API
    const apis = [
      { url: `${this.PRIMARY_URL}/${fromCurrency}`, name: 'Primary' },
      { url: `${this.FALLBACK_URL}/${fromCurrency}`, name: 'Fallback' }
    ]

    for (const api of apis) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Fetching exchange rates from ${api.name} API: ${api.url}`)
        }
        
        const response = await fetch(api.url)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`${api.name} API Response Error: ${response.status} ${response.statusText}`, errorText)
          throw new Error(`Exchange rate API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        if (process.env.NODE_ENV === 'development') {
          console.log(`${api.name} API Response for ${fromCurrency}:`, data)
        }
        
        // Handle different response formats
        let rates: Record<string, number>
        if (data.rates) {
          // Primary API format
          rates = data.rates
        } else if (data.conversion_rates) {
          // Alternative format
          rates = data.conversion_rates
        } else {
          console.error(`${api.name} API response missing rates field:`, data)
          throw new Error('Invalid API response format - missing rates')
        }

        const rate = rates[toCurrency]
        
        if (!rate) {
          console.error(`Rate not found for ${toCurrency} in ${api.name} API rates:`, Object.keys(rates))
          throw new Error(`Exchange rate not found for ${toCurrency}`)
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`Found exchange rate ${fromCurrency} -> ${toCurrency} from ${api.name} API: ${rate}`)
        }

        // Cache the rate
        rateCache[cacheKey] = {
          rate,
          timestamp: Date.now()
        }

        return rate
      } catch (error) {
        console.error(`Error with ${api.name} API for ${fromCurrency} -> ${toCurrency}:`, error)
        // Continue to next API
      }
    }

    // All APIs failed, try fallbacks
    console.error(`All APIs failed for ${fromCurrency} -> ${toCurrency}`)
    
    // Return cached rate even if expired as fallback
    if (cached) {
      console.warn(`Using expired exchange rate as fallback: ${cached.rate}`)
      return cached.rate
    }
    
    // Ultimate fallback: assume 1:1 rate
    console.warn(`Using 1:1 exchange rate as ultimate fallback for ${fromCurrency} -> ${toCurrency}`)
    return 1
  }

  /**
   * Convert amount from one currency to another
   */
  static async convertAmount(
    amount: number, 
    fromCurrency: Currency, 
    toCurrency: Currency
  ): Promise<number> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency)
    return amount * rate
  }

  /**
   * Get multiple exchange rates at once for efficiency
   */
  static async getMultipleRates(
    baseCurrency: Currency, 
    targetCurrencies: Currency[]
  ): Promise<Record<Currency, number>> {
    // Filter out same currency
    const uniqueTargets = targetCurrencies.filter(curr => curr !== baseCurrency)
    
    if (uniqueTargets.length === 0) {
      return { [baseCurrency]: 1 } as Record<Currency, number>
    }

    // Try primary API first, then fallback API
    const apis = [
      { url: `${this.PRIMARY_URL}/${baseCurrency}`, name: 'Primary' },
      { url: `${this.FALLBACK_URL}/${baseCurrency}`, name: 'Fallback' }
    ]

    for (const api of apis) {
      try {
        const response = await fetch(api.url)
        
        if (!response.ok) {
          throw new Error(`Exchange rate API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        // Handle different response formats
        let apiRates: Record<string, number>
        if (data.rates) {
          // Primary API format
          apiRates = data.rates
        } else if (data.conversion_rates) {
          // Alternative format
          apiRates = data.conversion_rates
        } else {
          throw new Error('Invalid API response format - missing rates')
        }

        const rates: Record<Currency, number> = { [baseCurrency]: 1 } as Record<Currency, number>
        
        // Cache and return all requested rates
        uniqueTargets.forEach(currency => {
          const rate = apiRates[currency]
          if (rate) {
            rates[currency] = rate
            
            // Cache the rate
            const cacheKey = `${baseCurrency}-${currency}`
            rateCache[cacheKey] = {
              rate,
              timestamp: Date.now()
            }
          }
        })

        return rates
      } catch (error) {
        console.error(`Error with ${api.name} API for multiple rates:`, error)
        // Continue to next API
      }
    }

    // All APIs failed
    console.error('Error fetching multiple exchange rates - all APIs failed')
    
    // Fallback: try to get individual rates from cache or return 1:1
    const fallbackRates: Record<Currency, number> = { [baseCurrency]: 1 } as Record<Currency, number>
    
    uniqueTargets.forEach(currency => {
      const cacheKey = `${baseCurrency}-${currency}`
      const cached = rateCache[cacheKey]
      fallbackRates[currency] = cached ? cached.rate : 1
    })
    
    return fallbackRates
  }

  /**
   * Clear exchange rate cache (useful for testing or manual refresh)
   */
  static clearCache(): void {
    Object.keys(rateCache).forEach(key => delete rateCache[key])
  }

  /**
   * Get cache status for debugging
   */
  static getCacheInfo(): Array<{ pair: string; rate: number; age: string }> {
    return Object.entries(rateCache).map(([pair, data]) => ({
      pair,
      rate: data.rate,
      age: `${Math.round((Date.now() - data.timestamp) / 60000)}min ago`
    }))
  }
}