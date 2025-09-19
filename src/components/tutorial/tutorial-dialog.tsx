'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, X, HelpCircle, FolderTree, CreditCard, BarChart3, Zap, Hand } from 'lucide-react'
import { TutorialPreferences } from '@/lib/tutorial'
import { useLanguage } from '@/contexts/language-context'

interface TutorialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function TutorialDialog({ open, onOpenChange, onComplete }: TutorialDialogProps) {
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState(0)
  const [showDismissOption, setShowDismissOption] = useState(false)

  // Tutorial steps from translations
  const steps = [
    {
      id: 'welcome',
      title: t('tutorial.welcome.title'),
      description: t('tutorial.welcome.description'),
      buttonText: t('tutorial.welcome.button')
    },
    {
      id: 'projects',
      title: t('tutorial.projects.title'),
      description: t('tutorial.projects.description'),
      buttonText: t('tutorial.projects.button')
    },
    {
      id: 'subscriptions',
      title: t('tutorial.subscriptions.title'),
      description: t('tutorial.subscriptions.description'),
      buttonText: t('tutorial.subscriptions.button')
    },
    {
      id: 'dashboard',
      title: t('tutorial.dashboard.title'),
      description: t('tutorial.dashboard.description'),
      buttonText: t('tutorial.dashboard.button')
    },
    {
      id: 'ready',
      title: t('tutorial.ready.title'),
      description: t('tutorial.ready.description'),
      buttonText: t('tutorial.ready.button')
    }
  ]

  const totalSteps = steps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  useEffect(() => {
    if (open) {
      setCurrentStep(0)
      setShowDismissOption(false)
    }
  }, [open])

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onOpenChange(false)
    onComplete?.()
  }

  const handleDismiss = () => {
    TutorialPreferences.dismiss()
    onOpenChange(false)
    onComplete?.()
  }

  const handleSkip = () => {
    setShowDismissOption(true)
  }

  const currentStepData = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  // Icon mapping for consistent styling
  const STEP_ICONS = {
    welcome: Hand,
    projects: FolderTree,
    subscriptions: CreditCard,
    dashboard: BarChart3,
    ready: Zap
  } as const

  const IconComponent = STEP_ICONS[currentStepData.id as keyof typeof STEP_ICONS]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-semibold text-center">{t('tutorial.title')}</DialogTitle>

        {/* Header */}
        <div className="text-center text-sm text-muted-foreground">
          <span>{t('tutorial.stepCounter', { current: currentStep + 1, total: totalSteps })}</span>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Step Content */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <IconComponent className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {currentStepData.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            {/* Main Action Button */}
            <Button
              onClick={handleNext}
              className="w-full"
              size="lg"
            >
              {isLastStep ? t('tutorial.ready.button') : (currentStepData.buttonText || t('common.next') || 'Next')}
              {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>

            {/* Secondary Actions */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
              >
                {!isFirstStep && (
                  <>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {t('tutorial.back')}
                  </>
                )}
              </Button>

              {!showDismissOption ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                >
                  {t('tutorial.skip')}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                >
                  {t('tutorial.dontShowAgain')}
                </Button>
              )}
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-primary/60'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Progress bar at bottom */}
          <Progress value={progress} className="h-2" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper component for manual tutorial trigger
export function TutorialHelpButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        title="Show tutorial"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      <TutorialDialog
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}