import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** 0–3 strength score: length >= 8, has a number, has a special char. */
export function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  return score;
}

const REQUIREMENTS = [
  {
    key: 'length',
    label: 'Al menos 8 caracteres',
  },
  {
    key: 'number',
    label: 'Al menos un número',
  },
  {
    key: 'special',
    label: 'Al menos un carácter especial',
  },
] as const;

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const requirements = REQUIREMENTS.map((requirement, index) => {
    const met =
      (index === 0 && password.length >= 8) ||
      (index === 1 && /\d/.test(password)) ||
      (index === 2 && /[!@#$%^&*(),.?":{}|<>]/.test(password));

    return {
      ...requirement,
      met,
    };
  });

  return (
    <div className="mt-2 rounded-xl bg-background/70">
      <div className="flex flex-col gap-2">
        {requirements.map((requirement) => (
          <div key={requirement.key} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                requirement.met
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground/40 bg-transparent text-muted-foreground/70',
              )}
            >
              <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
            <span
              className={cn(
                'text-sm transition-all',
                requirement.met ? 'text-foreground line-through decoration-primary/70' : 'text-muted-foreground',
              )}
            >
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
