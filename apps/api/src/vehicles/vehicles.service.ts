import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleEntity } from './vehicle.entity';
import { VehicleStatus } from '@g-rent/types';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectRepository(VehicleEntity)
    private readonly vehicleRepo: Repository<VehicleEntity>,
  ) {}

  async findAll(): Promise<VehicleEntity[]> {
    return this.vehicleRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<VehicleEntity> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${id} not found`);
    }
    return vehicle;
  }

  async findByGpsDeviceId(gpsDeviceId: string): Promise<VehicleEntity | null> {
    return this.vehicleRepo.findOne({ where: { gpsDeviceId } });
  }

  async updatePosition(
    vehicleId: string,
    latitude: number,
    longitude: number,
    speed: number,
  ): Promise<VehicleEntity> {
    await this.vehicleRepo.update(vehicleId, {
      currentLatitude: latitude,
      currentLongitude: longitude,
      currentSpeed: speed,
      lastPositionAt: new Date(),
    });
    return this.findById(vehicleId);
  }

  async updateStatus(vehicleId: string, status: VehicleStatus): Promise<VehicleEntity> {
    await this.vehicleRepo.update(vehicleId, { status });
    return this.findById(vehicleId);
  }

  async seed(): Promise<VehicleEntity[]> {
    const count = await this.vehicleRepo.count();
    if (count > 0) {
      this.logger.log('Vehicles already seeded');
      return this.findAll();
    }

    const vehicles = this.vehicleRepo.create([
      {
        make: 'Toyota',
        model: 'Corolla',
        year: 2024,
        licensePlate: 'GR-001-AA',
        status: VehicleStatus.AVAILABLE,
        pricePerDay: 50,
        currentLatitude: 48.8566,
        currentLongitude: 2.3522,
        imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
        gpsDeviceId: 'dev-001',
      },
      {
        make: 'BMW',
        model: '3 Series',
        year: 2023,
        licensePlate: 'GR-002-BB',
        status: VehicleStatus.AVAILABLE,
        pricePerDay: 50,
        currentLatitude: 48.8606,
        currentLongitude: 2.3376,
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
        gpsDeviceId: 'dev-002',
      },
      {
        make: 'Mercedes',
        model: 'C-Class',
        year: 2024,
        licensePlate: 'GR-003-CC',
        status: VehicleStatus.AVAILABLE,
        pricePerDay: 50,
        currentLatitude: 48.8530,
        currentLongitude: 2.3499,
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
        gpsDeviceId: 'dev-003',
      },
      {
        make: 'Audi',
        model: 'A4',
        year: 2023,
        licensePlate: 'GR-004-DD',
        status: VehicleStatus.RENTED,
        pricePerDay: 50,
        currentLatitude: 48.8650,
        currentLongitude: 2.3250,
        imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400',
        gpsDeviceId: 'dev-004',
      },
    ]);

    const saved = await this.vehicleRepo.save(vehicles);
    this.logger.log(`Seeded ${saved.length} vehicles`);
    return saved;
  }
}
