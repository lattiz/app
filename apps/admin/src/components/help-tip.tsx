import { CircleHelp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function HelpTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={text}
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <CircleHelp className="size-3.5" />
          </button>
        }
      />
      <TooltipContent className="max-w-64 text-balance">{text}</TooltipContent>
    </Tooltip>
  );
}
