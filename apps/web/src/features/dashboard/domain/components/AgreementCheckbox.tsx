import type { DomainAgreementDto } from '@lattiz/api-client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Props {
  agreement: DomainAgreementDto;
  checked: boolean;
  onToggle: (agreementType: string) => void;
}

export function AgreementCheckbox({ agreement, checked, onToggle }: Props) {
  const id = `agreement-${agreement.agreementType}`;
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={() => onToggle(agreement.agreementType)}
      />
      <Label htmlFor={id} className="text-sm leading-snug font-normal">
        <span>
          Acepto{' '}
          {agreement.url ? (
            <a
              href={agreement.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              {agreement.title}
            </a>
          ) : (
            agreement.title
          )}
        </span>
      </Label>
    </div>
  );
}
