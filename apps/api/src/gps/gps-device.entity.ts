import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('gps_devices')
export class GPSDeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @Index()
  imei!: string;

  @Column({ nullable: true })
  vehicleId?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSeenAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
