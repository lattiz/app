import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SearchDomainsDto {
  /** Keyword to search domains for (no TLD — variants are generated server-side). */
  @IsString()
  @MinLength(2)
  @MaxLength(63)
  @Matches(/^[a-z0-9][a-z0-9-]*$/, {
    message: 'Solo letras minúsculas, números y guiones',
  })
  q!: string;
}
