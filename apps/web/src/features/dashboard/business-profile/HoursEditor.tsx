import { PlusIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  type HoursState,
  WEEKDAY_LABELS,
  WEEKDAYS,
  type Weekday,
} from './business-profile';

interface HoursEditorProps {
  hours: HoursState;
  onChange: (hours: HoursState) => void;
}

/** Up to two ranges per day; a close earlier than the open runs past midnight. */
export function HoursEditor({ hours, onChange }: HoursEditorProps) {
  const setDay = (day: Weekday, ranges: HoursState[Weekday]) =>
    onChange({ ...hours, [day]: ranges });

  return (
    <div className="divide-y rounded-xl border">
      {WEEKDAYS.map((day) => {
        const ranges = hours[day];
        const open = ranges.length > 0;
        return (
          <div
            key={day}
            className="flex flex-col gap-2 p-3 sm:flex-row sm:items-start"
          >
            <label className="flex w-36 shrink-0 items-center gap-2 text-sm">
              <Switch
                checked={open}
                onCheckedChange={(checked) =>
                  setDay(
                    day,
                    checked ? [{ open: '09:00', close: '19:00' }] : [],
                  )
                }
                aria-label={`${WEEKDAY_LABELS[day]} abierto`}
              />
              {WEEKDAY_LABELS[day]}
            </label>
            {open ? (
              <div className="flex flex-1 flex-col gap-2">
                {ranges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="w-32"
                      value={range.open}
                      aria-label={`${WEEKDAY_LABELS[day]}: abre`}
                      onChange={(e) =>
                        setDay(
                          day,
                          ranges.map((r, i) =>
                            i === index ? { ...r, open: e.target.value } : r,
                          ),
                        )
                      }
                    />
                    <span className="text-sm text-muted-foreground">a</span>
                    <Input
                      type="time"
                      className="w-32"
                      value={range.close}
                      aria-label={`${WEEKDAY_LABELS[day]}: cierra`}
                      onChange={(e) =>
                        setDay(
                          day,
                          ranges.map((r, i) =>
                            i === index ? { ...r, close: e.target.value } : r,
                          ),
                        )
                      }
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Quitar horario"
                        onClick={() =>
                          setDay(
                            day,
                            ranges.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <XIcon />
                      </Button>
                    )}
                  </div>
                ))}
                {ranges.length < 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={() =>
                      setDay(day, [
                        ...ranges,
                        { open: '16:00', close: '20:00' },
                      ])
                    }
                  >
                    <PlusIcon data-icon="inline-start" />
                    Agregar horario
                  </Button>
                )}
              </div>
            ) : (
              <span className="py-1 text-sm text-muted-foreground">
                Cerrado
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
