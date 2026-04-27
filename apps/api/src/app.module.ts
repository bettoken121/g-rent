import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { VehiclesModule } from './vehicles/vehicles.module';
import { RentalsModule } from './rentals/rentals.module';
import { GpsModule } from './gps/gps.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AuthModule } from './auth/auth.module';
import { VehicleEntity } from './vehicles/vehicle.entity';
import { GPSDeviceEntity } from './gps/gps-device.entity';
import { PositionLogEntity } from './gps/position-log.entity';
import { RentalEntity } from './rentals/rental.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>(
          'DATABASE_URL',
          'postgresql://postgres:postgres@localhost:5432/grent',
        ),
        entities: [VehicleEntity, GPSDeviceEntity, PositionLogEntity, RentalEntity],
        synchronize: config.get<string>('NODE_ENV', 'development') !== 'production',
        logging: config.get<string>('NODE_ENV', 'development') !== 'production',
      }),
    }),
    VehiclesModule,
    RentalsModule,
    GpsModule,
    RealtimeModule,
    AuthModule,
  ],
})
export class AppModule {}
