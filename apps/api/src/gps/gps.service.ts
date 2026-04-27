import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GPSDeviceEntity } from './gps-device.entity';
import { PositionLogEntity } from './position-log.entity';
import { GpsIngestDto } from './gps-ingest.dto';
import { VehiclesService } from '../vehicles/vehicles.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { validateIMEI } from '@g-rent/utils';

@Injectable()
export class GpsService {
  private readonly logger = new Logger(GpsService.name);

  constructor(
    @InjectRepository(GPSDeviceEntity)
    private readonly deviceRepo: Repository<GPSDeviceEntity>,
    @InjectRepository(PositionLogEntity)
    private readonly positionRepo: Repository<PositionLogEntity>,
    private readonly vehiclesService: VehiclesService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async ingest(dto: GpsIngestDto): Promise<{ success: boolean }> {
    if (!validateIMEI(dto.imei)) {
      this.logger.warn(`Invalid IMEI format: ${dto.imei}`);
      throw new BadRequestException('Invalid IMEI format');
    }

    let device = await this.deviceRepo.findOne({ where: { imei: dto.imei } });

    if (!device) {
      device = this.deviceRepo.create({
        imei: dto.imei,
        isActive: true,
        lastSeenAt: new Date(),
      });
      device = await this.deviceRepo.save(device);
      this.logger.log(`New GPS device registered: ${dto.imei}`);
    } else {
      await this.deviceRepo.update(device.id, { lastSeenAt: new Date() });
    }

    const positionLog = this.positionRepo.create({
      deviceId: device.id,
      vehicleId: device.vehicleId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      speed: dto.speed,
      timestamp: new Date(dto.timestamp),
      rawData: JSON.stringify(dto),
    });

    await this.positionRepo.save(positionLog);

    if (device.vehicleId) {
      const vehicle = await this.vehiclesService.updatePosition(
        device.vehicleId,
        dto.latitude,
        dto.longitude,
        dto.speed,
      );

      this.realtimeGateway.broadcastPosition({
        imei: dto.imei,
        latitude: dto.latitude,
        longitude: dto.longitude,
        speed: dto.speed,
        timestamp: new Date(dto.timestamp),
      });

      this.realtimeGateway.broadcastVehicleUpdate(vehicle);
    }

    this.logger.debug(
      `GPS data ingested: IMEI=${dto.imei} lat=${dto.latitude} lng=${dto.longitude} speed=${dto.speed}`,
    );

    return { success: true };
  }

  async seedDevices(): Promise<GPSDeviceEntity[]> {
    const count = await this.deviceRepo.count();
    if (count > 0) {
      return this.deviceRepo.find();
    }

    const vehicles = await this.vehiclesService.findAll();
    const devices: GPSDeviceEntity[] = [];

    for (const vehicle of vehicles) {
      if (vehicle.gpsDeviceId) {
        const imei = `35678901234${vehicle.gpsDeviceId.replace('dev-', '').padStart(4, '0')}`;
        const device = this.deviceRepo.create({
          imei,
          vehicleId: vehicle.id,
          isActive: true,
          lastSeenAt: new Date(),
        });
        devices.push(await this.deviceRepo.save(device));
      }
    }

    this.logger.log(`Seeded ${devices.length} GPS devices`);
    return devices;
  }
}
