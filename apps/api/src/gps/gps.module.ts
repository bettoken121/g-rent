import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GPSDeviceEntity } from './gps-device.entity';
import { PositionLogEntity } from './position-log.entity';
import { GpsService } from './gps.service';
import { GpsController } from './gps.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GPSDeviceEntity, PositionLogEntity]),
    VehiclesModule,
    RealtimeModule,
  ],
  controllers: [GpsController],
  providers: [GpsService],
  exports: [GpsService],
})
export class GpsModule {}
