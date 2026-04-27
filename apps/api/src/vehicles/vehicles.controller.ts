import { Controller, Get, Param, Post, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { VehicleEntity } from './vehicle.entity';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  private readonly logger = new Logger(VehiclesController.name);

  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'List all vehicles' })
  async findAll(): Promise<VehicleEntity[]> {
    this.logger.log('GET /vehicles');
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  async findById(@Param('id') id: string): Promise<VehicleEntity> {
    this.logger.log(`GET /vehicles/${id}`);
    return this.vehiclesService.findById(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed demo vehicles' })
  async seed(): Promise<VehicleEntity[]> {
    this.logger.log('POST /vehicles/seed');
    return this.vehiclesService.seed();
  }
}
