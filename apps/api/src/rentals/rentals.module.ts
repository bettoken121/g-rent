import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalEntity } from './rental.entity';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [TypeOrmModule.forFeature([RentalEntity]), VehiclesModule],
  controllers: [RentalsController],
  providers: [RentalsService],
  exports: [RentalsService],
})
export class RentalsModule {}
