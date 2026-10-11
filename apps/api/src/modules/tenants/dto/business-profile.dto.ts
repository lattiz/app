import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
  registerDecorator,
  type ValidationOptions,
} from 'class-validator';

export const BUSINESS_CATEGORIES = [
  'restaurant',
  'medical',
  'dental',
  'legal',
  'accounting',
  'beauty_salon',
  'barbershop',
  'store',
  'other',
] as const;
export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const WEEKDAYS = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;
export const DEFAULT_BUSINESS_TIMEZONE = 'America/Mexico_City';

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/;
const HTTPS_URL = { protocols: ['https'], require_protocol: true };

/** "" means "clear" in a PATCH, so it must reach the service as null, not fail a format check. */
const EmptyToNull = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === '' ? null : value,
  );

function IsIanaTimezone(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyName) =>
    registerDecorator({
      name: 'isIanaTimezone',
      target: target.constructor,
      propertyName: propertyName as string,
      options: { message: 'timezone must be an IANA time zone', ...options },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || value.length > 64) return false;
          try {
            new Intl.DateTimeFormat('en', { timeZone: value });
            return true;
          } catch {
            return false;
          }
        },
      },
    });
}

export class BusinessAddressDto {
  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  street?: string | null;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string | null;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  region?: string | null;

  @ApiPropertyOptional({ maxLength: 12 })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  postalCode?: string | null;

  /** ISO 3166-1 alpha-2, e.g. `MX`. */
  @ApiPropertyOptional({ maxLength: 2 })
  @EmptyToNull()
  @IsOptional()
  @Matches(/^[A-Za-z]{2}$/, { message: 'country must be a 2-letter code' })
  country?: string | null;
}

export class BusinessGeoDto {
  @ApiProperty()
  @IsNumber()
  @IsLatitude()
  lat!: number;

  @ApiProperty()
  @IsNumber()
  @IsLongitude()
  lng!: number;
}

/** `close` earlier than `open` means the range runs past midnight (e.g. 20:00–02:00). */
export class TimeRangeDto {
  @ApiPropertyOptional({ example: '09:00' })
  @Matches(TIME_RE, { message: 'open must be HH:MM' })
  open!: string;

  @ApiPropertyOptional({ example: '19:00' })
  @Matches(TIME_RE, { message: 'close must be HH:MM' })
  close!: string;
}

/** Up to two ranges per day; an empty list means closed that day. */
export class BusinessHoursDto {
  @ApiPropertyOptional({ type: [TimeRangeDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  mon?: TimeRangeDto[];

  @ApiPropertyOptional({ type: [TimeRangeDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  tue?: TimeRangeDto[];

  @ApiPropertyOptional({ type: [TimeRangeDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  wed?: TimeRangeDto[];

  @ApiPropertyOptional({ type: [TimeRangeDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  thu?: TimeRangeDto[];

  @ApiPropertyOptional({ type: [TimeRangeDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  fri?: TimeRangeDto[];

  @ApiPropertyOptional({ type: [TimeRangeDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  sat?: TimeRangeDto[];

  @ApiPropertyOptional({ type: [TimeRangeDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  sun?: TimeRangeDto[];
}

/** Public social profiles; https URLs only. */
export class BusinessSocialDto {
  @ApiPropertyOptional()
  @EmptyToNull()
  @IsOptional()
  @IsUrl(HTTPS_URL)
  @MaxLength(300)
  instagram?: string | null;

  @ApiPropertyOptional()
  @EmptyToNull()
  @IsOptional()
  @IsUrl(HTTPS_URL)
  @MaxLength(300)
  facebook?: string | null;

  @ApiPropertyOptional()
  @EmptyToNull()
  @IsOptional()
  @IsUrl(HTTPS_URL)
  @MaxLength(300)
  tiktok?: string | null;

  @ApiPropertyOptional()
  @EmptyToNull()
  @IsOptional()
  @IsUrl(HTTPS_URL)
  @MaxLength(300)
  youtube?: string | null;

  @ApiPropertyOptional()
  @EmptyToNull()
  @IsOptional()
  @IsUrl(HTTPS_URL)
  @MaxLength(300)
  x?: string | null;

  @ApiPropertyOptional()
  @EmptyToNull()
  @IsOptional()
  @IsUrl(HTTPS_URL)
  @MaxLength(300)
  linkedin?: string | null;

  @ApiPropertyOptional()
  @EmptyToNull()
  @IsOptional()
  @IsUrl(HTTPS_URL)
  @MaxLength(300)
  googleMaps?: string | null;
}

/**
 * "Datos del negocio". As a PATCH body: an omitted key is left unchanged, and
 * null or an empty string clears it; nested objects (address, hours, social)
 * are replaced whole. Phones are stored in E.164.
 */
export class BusinessProfileDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string | null;

  @ApiPropertyOptional({ enum: BUSINESS_CATEGORIES })
  @EmptyToNull()
  @IsOptional()
  @IsIn(BUSINESS_CATEGORIES)
  category?: BusinessCategory | null;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  /** Any common format; stored as E.164 (Mexico assumed when there is no country code). */
  @ApiPropertyOptional({ maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string | null;

  @ApiPropertyOptional({ maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  whatsapp?: string | null;

  @ApiPropertyOptional({ maxLength: 254 })
  @EmptyToNull()
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @ApiPropertyOptional({ type: BusinessAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessAddressDto)
  address?: BusinessAddressDto | null;

  @ApiPropertyOptional({ type: BusinessGeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessGeoDto)
  geo?: BusinessGeoDto | null;

  @ApiPropertyOptional({ type: BusinessHoursDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  hours?: BusinessHoursDto | null;

  /** IANA zone the hours are in; defaults to America/Mexico_City when read. */
  @ApiPropertyOptional({ example: DEFAULT_BUSINESS_TIMEZONE })
  @EmptyToNull()
  @IsOptional()
  @IsIanaTimezone()
  timezone?: string | null;

  @ApiPropertyOptional({ enum: PRICE_RANGES })
  @EmptyToNull()
  @IsOptional()
  @IsIn(PRICE_RANGES)
  priceRange?: (typeof PRICE_RANGES)[number] | null;

  @ApiPropertyOptional({ type: BusinessSocialDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessSocialDto)
  social?: BusinessSocialDto | null;

  @ApiPropertyOptional()
  @EmptyToNull()
  @IsOptional()
  @IsUrl(HTTPS_URL)
  @MaxLength(500)
  logoUrl?: string | null;
}
