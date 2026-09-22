import type { TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

// Custom tooltip so the tour respects the dashboard's ShadCN tokens (and
// dark mode) instead of react-joyride's own default styling.
export function OnboardingTooltip({
  backProps,
  index,
  isLastStep,
  primaryProps,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <Card
      {...tooltipProps}
      size="sm"
      className="w-80 shadow-lg ring-1 ring-foreground/10"
    >
      <CardContent>
        {step.title && (
          <p className="mb-1 font-heading font-medium">{step.title}</p>
        )}
        <p className="text-sm text-muted-foreground">{step.content}</p>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button variant="ghost" size="sm" {...skipProps}>
          Omitir
        </Button>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <Button variant="ghost" size="sm" {...backProps}>
              Atrás
            </Button>
          )}
          <Button variant="default" size="sm" {...primaryProps}>
            {isLastStep ? 'Finalizar' : 'Siguiente'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
