import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span>{t('landing.footer.copyright', { year: currentYear })}</span>
            <span className="text-xs">Miral Media P.IVA.: IT04901620262</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="scale-110">
              <LanguageSwitcher />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-center">
              <Link
                href="/privacy-policy"
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                {t('landing.footer.privacy')}
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                {t('landing.footer.terms')}
              </Link>
              <Link
                href="/cookie-policy"
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                {t('landing.footer.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>


    </footer>
  )
}