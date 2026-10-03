import {
  ArrayMinSize,
  IsArray,
  IsFQDN,
  IsInt,
  IsISO8601,
  IsString,
  Min,
} from 'class-validator';

export class PurchaseDomainDto {
  /** Fully-qualified domain to purchase. */
  @IsFQDN()
  @IsString()
  domain!: string;

  /** Agreement types the user accepted — must match the quote's requiredAgreements. */
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  agreementTypes!: string[];

  /** ISO timestamp of when the user actually clicked "Acepto" — never fabricated. */
  @IsISO8601()
  agreedAt!: string;

  /** Price the user saw in the quote, in USD cents; the purchase is rejected if the current price is higher. */
  @IsInt()
  @Min(1)
  priceUsdCents!: number;
}
