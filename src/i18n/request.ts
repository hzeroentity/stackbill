import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // For now, we'll use a simple approach to get locale from localStorage
  // In a more complex setup, you'd get this from URL params, cookies, etc.
  let locale = 'en';
  
  // Try to get locale from browser environment if available
  if (typeof window !== 'undefined') {
    locale = localStorage.getItem('preferred-language') || 'en';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});