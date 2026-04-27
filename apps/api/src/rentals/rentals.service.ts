import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Not, In } from 'typeorm';
import { RentalEntity } from './rental.entity';
import { CreateRentalDto } from './create-rental.dto';
import { VehiclesService } from '../vehicles/vehicles.service';
import { calculatePrice } from '@g-rent/utils';
import { RentalStatus, VehicleStatus } from '@g-rent/types';

@Injectable()
export class RentalsService {
  private readonly logger = new Logger(RentalsService.name);

  constructor(
    @InjectRepository(RentalEntity)
    private readonly rentalRepo: Repository<RentalEntity>,
    private readonly vehiclesService: VehiclesService,
  ) {}

  async create(dto: CreateRentalDto): Promise<RentalEntity> {
    const vehicle = await this.vehiclesService.findById(dto.vehicleId);

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const diffTime = endDate.getTime() - startDate.getTime();
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      throw new BadRequestException('Rental must be at least 1 day');
    }

    const overlapping = await this.rentalRepo
      .createQueryBuilder('rental')
      .where('rental.vehicleId = :vehicleId', { vehicleId: dto.vehicleId })
      .andWhere('rental.status IN (:...statuses)', {
        statuses: [RentalStatus.PENDING, RentalStatus.ACTIVE],
      })
      .andWhere('rental.startDate <= :endDate', { endDate: dto.endDate })
      .andWhere('rental.endDate >= :startDate', { startDate: dto.startDate })
      .getCount();

    if (overlapping > 0) {
      throw new ConflictException('Vehicle is already booked for the selected dates');
    }

    const { pricePerDay, totalPrice } = calculatePrice(totalDays);

    const rental = this.rentalRepo.create({
      vehicleId: vehicle.id,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalDays,
      pricePerDay,
      totalPrice,
      status: RentalStatus.PENDING,
    });

    const saved = await this.rentalRepo.save(rental);
    this.logger.log(
      `Rental created: ${saved.id} for vehicle ${vehicle.id} (${totalDays} days, €${totalPrice})`,
    );

    await this.vehiclesService.updateStatus(vehicle.id, VehicleStatus.RENTED);

    return saved;
  }

  async findAll(): Promise<RentalEntity[]> {
    return this.rentalRepo.find({
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPrice(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      throw new BadRequestException('Invalid date range');
    }

    return calculatePrice(totalDays);
  }
}
