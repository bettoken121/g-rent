import { IsString, IsEmail, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRentalDto {
  @ApiProperty()
  @IsUUID()
  vehicleId!: string;

  @ApiProperty()
  @IsString()
  customerName!: string;

  @ApiProperty()
  @IsEmail()
  customerEmail!: string;

  @ApiProperty()
  @IsString()
  customerPhone!: string;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiProperty()
  @IsDateString()
  endDate!: string;
}
