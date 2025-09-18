'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, X, HelpCircle } from 'lucide-react'
import { TUTORIAL_CONFIG, TutorialPreferences } from '@/lib/tutorial'

interface TutorialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function TutorialDialog({ open, onOpenChange, onComplete }: TutorialDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showDismissOption, setShowDismissOption] = useState(false)

  const steps = TUTORIAL_CONFIG.steps
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0">
        {/* Header with progress */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="absolute right-2 top-2 h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Quick Guide</h2>
              <span className="text-sm text-white/80">
                {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step Content */}
          <div className="text-center space-y-4">
            {currentStepData.icon && (
              <div className="text-4xl">{currentStepData.icon}</div>
            )}

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
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
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="lg"
            >
              {isLastStep ? 'Start Tracking' : (currentStepData.buttonText || 'Next')}
              {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>

            {/* Secondary Actions */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="text-muted-foreground"
              >
                {!isFirstStep && (
                  <>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </>
                )}
              </Button>

              {!showDismissOption ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Skip guide
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-muted-foreground"
                >
                  Don&apos;t show again
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