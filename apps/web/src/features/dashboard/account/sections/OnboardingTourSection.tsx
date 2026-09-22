import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

// Re-launches the guided tour regardless of the dismissal flag — the tour's
// own step `before` hooks handle navigation, so this works from any page.
export function OnboardingTourSection() {
  const startTour = useOnboardingStore((s) => s.startTour);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tour guiado</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Repite la guía paso a paso para lanzar tu sitio.
        </p>
        <Button variant="outline" size="sm" onClick={startTour}>
          Ver tour guiado
        </Button>
      </CardContent>
    </Card>
  );
}
