import { createFileRoute } from '@tanstack/react-router';
import { CustomizationPage } from '@/pages/dashboard/CustomizationPage';

export const Route = createFileRoute('/_authenticated/dashboard/customization')({
  component: CustomizationPage,
});
