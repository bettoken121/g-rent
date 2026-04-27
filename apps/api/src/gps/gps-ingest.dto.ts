import { IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GpsIngestDto {
  @ApiProperty()
  @IsString()
  imei!: string;

  @ApiProperty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  speed!: number;

  @ApiProperty()
  @IsDateString()
  timestamp!: string;
}
