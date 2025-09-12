import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>{t('landing.footer.copyright', { year: currentYear })}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-foreground transition-colors">
                {t('landing.footer.privacy')}
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                {t('landing.footer.terms')}
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                {t('landing.footer.support')}
              </Link>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}