import { IsDefined, IsOptional, IsString } from 'class-validator';

export class StartCrawlDto {
  @IsDefined()
  @IsString()
  readonly url: string;

  @IsDefined()
  @IsString({ each: true })
  readonly keyword: string[];

  @IsOptional()
  @IsString({ each: true })
  readonly categoryFilters: string[] = [];
}
