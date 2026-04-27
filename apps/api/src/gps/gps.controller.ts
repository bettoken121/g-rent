import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GpsService } from './gps.service';
import { GpsIngestDto } from './gps-ingest.dto';

@ApiTags('gps')
@Controller('gps')
export class GpsController {
  private readonly logger = new Logger(GpsController.name);

  constructor(private readonly gpsService: GpsService) {}

  @Post('ingest')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: 'Ingest GPS position data' })
  async ingest(@Body() dto: GpsIngestDto) {
    this.logger.log(`POST /gps/ingest IMEI=${dto.imei}`);
    return this.gpsService.ingest(dto);
  }

  @Post('seed-devices')
  @ApiOperation({ summary: 'Seed GPS devices for demo' })
  async seedDevices() {
    return this.gpsService.seedDevices();
  }
}
