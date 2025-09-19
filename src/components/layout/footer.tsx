import { useState } from "react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()
  const [activeDialog, setActiveDialog] = useState<'privacy' | 'terms' | 'cookies' | null>(null)
  
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>{t('landing.footer.copyright', { year: currentYear })}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveDialog('privacy')}
                className="hover:text-foreground transition-colors"
              >
                {t('landing.footer.privacy')}
              </button>
              <button
                onClick={() => setActiveDialog('terms')}
                className="hover:text-foreground transition-colors"
              >
                {t('landing.footer.terms')}
              </button>
              <button
                onClick={() => setActiveDialog('cookies')}
                className="hover:text-foreground transition-colors"
              >
                {t('landing.footer.cookies')}
              </button>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Legal dialogs */}
      <Dialog open={activeDialog === 'privacy'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-lg font-semibold">{t('landing.footer.privacy')}</DialogTitle>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t('legal.comingSoon.message')}
            </p>
            <Button onClick={() => setActiveDialog(null)} className="w-full">
              {t('common.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'terms'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-lg font-semibold">{t('landing.footer.terms')}</DialogTitle>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t('legal.comingSoon.message')}
            </p>
            <Button onClick={() => setActiveDialog(null)} className="w-full">
              {t('common.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'cookies'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-lg font-semibold">{t('landing.footer.cookies')}</DialogTitle>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t('legal.comingSoon.message')}
            </p>
            <Button onClick={() => setActiveDialog(null)} className="w-full">
              {t('common.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  )
}