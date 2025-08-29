"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'it' | 'es'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, unknown>) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

// Import all translations
import enMessages from '../../messages/en.json'
import itMessages from '../../messages/it.json'
import esMessages from '../../messages/es.json'

const translations = {
  en: enMessages,
  it: itMessages,
  es: esMessages,
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem('preferred-language') as Language
    if (saved && ['en', 'it', 'es'].includes(saved)) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('preferred-language', lang)
  }

  const t = (key: string, params?: Record<string, unknown>) => {
    const keys = key.split('.')
    let value: unknown = translations[language]
    
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key not found: ${key}`)
      return key
    }

    // Simple parameter replacement
    if (params) {
      let result = value
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue))
      })
      return result
    }

    return value
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}