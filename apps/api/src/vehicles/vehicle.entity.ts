import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { VehicleStatus } from '@g-rent/types';
import { RentalEntity } from '../rentals/rental.entity';

@Entity('vehicles')
export class VehicleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  make!: string;

  @Column()
  model!: string;

  @Column()
  year!: number;

  @Column({ unique: true })
  licensePlate!: string;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.AVAILABLE })
  @Index()
  status!: VehicleStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 50 })
  pricePerDay!: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'double precision', nullable: true })
  currentLatitude?: number;

  @Column({ type: 'double precision', nullable: true })
  currentLongitude?: number;

  @Column({ type: 'double precision', nullable: true })
  currentSpeed?: number;

  @Column({ type: 'timestamp', nullable: true })
  lastPositionAt?: Date;

  @Column({ nullable: true })
  gpsDeviceId?: string;

  @OneToMany(() => RentalEntity, (rental) => rental.vehicle)
  rentals!: RentalEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
