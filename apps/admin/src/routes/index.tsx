import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/')({
  component: AdminHomePage,
});

function AdminHomePage() {
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Lattiz Admin</CardTitle>
          <CardDescription>Panel interno</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            El acceso y el diseño de este panel llegan en las siguientes
            tareas.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
