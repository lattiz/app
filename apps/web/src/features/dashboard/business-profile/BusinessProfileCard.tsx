import { useState } from 'react';
import type { BusinessProfileDto } from '@lattiz/api-client';
import { CopyIcon, StoreIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateBusinessProfile } from '@/hooks/use-business-profile';
import {
  bodyFromForm,
  CATEGORY_LABELS,
  DEFAULT_HOURS,
  formFromProfile,
  type HoursState,
  hoursError,
  hoursFromProfile,
  PRICE_RANGE_LABELS,
  type ProfileForm,
  type ProfileFormErrors,
  SITE_TOKENS,
  TIMEZONE_LABELS,
  validateForm,
} from './business-profile';
import { HoursEditor } from './HoursEditor';

interface BusinessProfileCardProps {
  tenantId: string;
  profile: BusinessProfileDto;
}

interface TextFieldProps {
  id: keyof ProfileForm;
  label: string;
  form: ProfileForm;
  errors: ProfileFormErrors;
  onChange: (key: keyof ProfileForm, value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  className?: string;
}

function TextField({
  id,
  label,
  form,
  errors,
  onChange,
  className,
  ...input
}: TextFieldProps) {
  const error = errors[id];
  return (
    <div className={className ? `space-y-1.5 ${className}` : 'space-y-1.5'}>
      <Label htmlFor={`bp-${id}`}>{label}</Label>
      <Input
        id={`bp-${id}`}
        value={form[id]}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(id, e.target.value)}
        {...input}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/** "Datos del negocio": feeds {{lz:*}} tokens and the JSON-LD of the published site. */
export function BusinessProfileCard({
  tenantId,
  profile,
}: BusinessProfileCardProps) {
  const [form, setForm] = useState(() => formFromProfile(profile));
  const [hours, setHours] = useState<HoursState | null>(() =>
    hoursFromProfile(profile.hours),
  );
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [hoursMessage, setHoursMessage] = useState<string | null>(null);
  const save = useUpdateBusinessProfile();

  const onChange = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    const nextHoursMessage = hoursError(hours);
    setErrors(nextErrors);
    setHoursMessage(nextHoursMessage);
    if (Object.keys(nextErrors).length > 0 || nextHoursMessage) {
      toast.error('Revisa los campos marcados.');
      return;
    }
    save.mutate({ path: { tenantId }, body: bodyFromForm(form, hours) });
  };

  const copyToken = (token: string) => {
    void navigator.clipboard
      ?.writeText(token)
      .then(() => toast.success(`Copiado: ${token}`))
      .catch(() => undefined);
  };

  const field = { form, errors, onChange };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StoreIcon className="size-4" />
          Datos del negocio
        </CardTitle>
        <CardDescription>
          Se usan en tu sitio publicado y ayudan a Google a mostrar tu
          dirección, teléfono y horario.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="name"
              label="Nombre del negocio"
              maxLength={100}
              {...field}
            />
            <div className="space-y-1.5">
              <Label htmlFor="bp-category">Giro</Label>
              <Select
                value={form.category || null}
                items={CATEGORY_LABELS}
                onValueChange={(value) => onChange('category', value ?? '')}
              >
                <SelectTrigger id="bp-category" className="w-full">
                  <SelectValue placeholder="Selecciona el giro" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bp-description">Descripción breve</Label>
              <Textarea
                id="bp-description"
                rows={3}
                maxLength={500}
                value={form.description}
                onChange={(e) => onChange('description', e.target.value)}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>
          </section>

          <Separator />

          <section className="grid gap-4 sm:grid-cols-3">
            <TextField
              id="phone"
              label="Teléfono"
              type="tel"
              inputMode="tel"
              placeholder="55 1234 5678"
              {...field}
            />
            <TextField
              id="whatsapp"
              label="WhatsApp"
              type="tel"
              inputMode="tel"
              placeholder="55 1234 5678"
              {...field}
            />
            <TextField
              id="email"
              label="Correo"
              type="email"
              placeholder="hola@tunegocio.mx"
              {...field}
            />
          </section>

          <Separator />

          <section className="grid gap-4 sm:grid-cols-6">
            <TextField
              id="street"
              label="Calle y número"
              className="sm:col-span-6"
              maxLength={160}
              {...field}
            />
            <TextField
              id="city"
              label="Ciudad"
              className="sm:col-span-2"
              maxLength={80}
              {...field}
            />
            <TextField
              id="region"
              label="Estado"
              className="sm:col-span-2"
              maxLength={80}
              {...field}
            />
            <TextField
              id="postalCode"
              label="C.P."
              inputMode="numeric"
              maxLength={12}
              {...field}
            />
            <TextField id="country" label="País" maxLength={2} {...field} />
            <TextField
              id="lat"
              label="Latitud (opcional)"
              inputMode="decimal"
              placeholder="19.4326"
              className="sm:col-span-3"
              {...field}
            />
            <TextField
              id="lng"
              label="Longitud (opcional)"
              inputMode="decimal"
              placeholder="-99.1332"
              className="sm:col-span-3"
              {...field}
            />
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={hours !== null}
                onCheckedChange={(checked) =>
                  setHours(checked ? (hours ?? DEFAULT_HOURS) : null)
                }
              />
              Mostrar horario de atención
            </label>
            {hours && (
              <>
                <HoursEditor hours={hours} onChange={setHours} />
                <div className="space-y-1.5 sm:max-w-sm">
                  <Label htmlFor="bp-timezone">Zona horaria</Label>
                  <Select
                    value={form.timezone}
                    items={TIMEZONE_LABELS}
                    onValueChange={(value) =>
                      onChange('timezone', value ?? 'America/Mexico_City')
                    }
                  >
                    <SelectTrigger id="bp-timezone" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIMEZONE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {hoursMessage && (
              <p className="text-xs text-destructive">{hoursMessage}</p>
            )}
          </section>

          <Separator />

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bp-price">Rango de precios</Label>
              <Select
                value={form.priceRange || null}
                items={PRICE_RANGE_LABELS}
                onValueChange={(value) => onChange('priceRange', value ?? '')}
              >
                <SelectTrigger id="bp-price" className="w-full">
                  <SelectValue placeholder="Sin especificar" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRICE_RANGE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TextField
              id="logoUrl"
              label="URL del logo"
              type="url"
              placeholder="https://"
              {...field}
            />
            <TextField
              id="instagram"
              label="Instagram"
              type="url"
              placeholder="https://instagram.com/tunegocio"
              {...field}
            />
            <TextField
              id="facebook"
              label="Facebook"
              type="url"
              placeholder="https://facebook.com/tunegocio"
              {...field}
            />
            <TextField
              id="tiktok"
              label="TikTok"
              type="url"
              placeholder="https://tiktok.com/@tunegocio"
              {...field}
            />
            <TextField
              id="youtube"
              label="YouTube"
              type="url"
              placeholder="https://youtube.com/@tunegocio"
              {...field}
            />
            <TextField
              id="googleMaps"
              label="Google Maps"
              type="url"
              placeholder="https://maps.app.goo.gl/…"
              className="sm:col-span-2"
              {...field}
            />
          </section>

          <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">Úsalos en tu sitio</p>
            <p className="text-xs text-muted-foreground">
              Escribe estas etiquetas en cualquier texto o enlace del editor y
              al publicar se cambian por tus datos. En el editor se ven tal
              cual; los visitantes nunca las ven.
            </p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {SITE_TOKENS.map(({ token, description }) => (
                <li key={token} className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => copyToken(token)}
                    className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 font-mono hover:bg-muted"
                    aria-label={`Copiar ${token}`}
                  >
                    {token}
                    <CopyIcon className="size-3" />
                  </button>
                  <span className="text-muted-foreground">{description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Spinner data-icon="inline-start" />}
              {save.isPending ? 'Guardando…' : 'Guardar datos'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
