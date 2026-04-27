import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('position_logs')
export class PositionLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  deviceId!: string;

  @Column({ nullable: true })
  @Index()
  vehicleId?: string;

  @Column({ type: 'double precision' })
  latitude!: number;

  @Column({ type: 'double precision' })
  longitude!: number;

  @Column({ type: 'double precision', default: 0 })
  speed!: number;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @Column({ type: 'text', nullable: true })
  rawData?: string;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;
}
