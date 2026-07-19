import { IsFQDN, IsString } from 'class-validator';

export class ConnectDomainDto {
  /** Domain the tenant already owns at another registrar, e.g. "miempresa.com". */
  @IsFQDN({ require_tld: true })
  @IsString()
  domain!: string;
}
