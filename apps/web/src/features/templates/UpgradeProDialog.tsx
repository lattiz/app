import { Link } from '@tanstack/react-router';
import { LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { templateAccessCopy as copy } from './template-access.copy';

interface UpgradeProDialogProps {
  /** Name of the Pro feature the user tried to use; null keeps the dialog closed. */
  feature: string | null;
  onClose: () => void;
}

export function UpgradeProDialog({ feature, onClose }: UpgradeProDialogProps) {
  return (
    <Dialog open={feature !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockIcon className="size-4" />
            {copy.proFeature.title(feature ?? '')}
          </DialogTitle>
          <DialogDescription>{copy.proFeature.body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {copy.proFeature.later}
          </Button>
          <Button render={<Link to="/dashboard/subscription" />}>
            {copy.upgradeCta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
