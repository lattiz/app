import {
  ArrayMinSize,
  IsArray,
  IsFQDN,
  IsInt,
  IsISO8601,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class PurchaseDomainDto {
  /** Fully-qualified domain to purchase. */
  @IsFQDN()
  @IsString()
  domain!: string;

  /** Single-use quote token from POST /domains/quote (10-minute TTL). */
  @IsString()
  @MinLength(1)
  quoteToken!: string;

  /** Agreement types the user accepted — must match the quote's requiredAgreements. */
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  agreementTypes!: string[];

  /** ISO timestamp of when the user actually clicked "Acepto" — never fabricated. */
  @IsISO8601()
  agreedAt!: string;

  /** Locked price from the quote, in USD cents. */
  @IsInt()
  @Min(1)
  priceUsdCents!: number;
}
