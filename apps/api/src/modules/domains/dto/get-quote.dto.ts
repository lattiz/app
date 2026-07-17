import { IsFQDN, IsString } from 'class-validator';

export class GetQuoteDto {
  /** Fully-qualified domain to quote, e.g. "miempresa.com". */
  @IsFQDN()
  @IsString()
  domain!: string;
}
