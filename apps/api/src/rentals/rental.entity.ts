import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { RentalStatus } from '@g-rent/types';
import { VehicleEntity } from '../vehicles/vehicle.entity';

@Entity('rentals')
@Check(`"endDate" > "startDate"`)
export class RentalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  vehicleId!: string;

  @ManyToOne(() => VehicleEntity, (vehicle) => vehicle.rentals)
  @JoinColumn({ name: 'vehicleId' })
  vehicle!: VehicleEntity;

  @Column()
  customerName!: string;

  @Column()
  customerEmail!: string;

  @Column()
  customerPhone!: string;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column()
  totalDays!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerDay!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ type: 'enum', enum: RentalStatus, default: RentalStatus.PENDING })
  @Index()
  status!: RentalStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
