import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserSearchDto {
  @ApiProperty({
    description: 'A search term to filter users by name or username.',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({
    description: 'The minimum age of users to be included in the search.',
    example: 18,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(16)
  minAge?: number;

  @ApiProperty({
    description: 'The maximum age of users to be included in the search.',
    example: 50,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Max(116)
  maxAge?: number;
}
