import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './create-rental.dto';

@ApiTags('rentals')
@Controller('rentals')
export class RentalsController {
  private readonly logger = new Logger(RentalsController.name);

  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a rental' })
  async create(@Body() dto: CreateRentalDto) {
    this.logger.log(`POST /rentals for vehicle ${dto.vehicleId}`);
    return this.rentalsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all rentals' })
  async findAll() {
    return this.rentalsService.findAll();
  }

  @Get('price')
  @ApiOperation({ summary: 'Calculate rental price' })
  async getPrice(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.rentalsService.getPrice(startDate, endDate);
  }
}
