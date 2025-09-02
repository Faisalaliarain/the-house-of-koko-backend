import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  features: string[];

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'GBP' })
  currency: string;

  @Column()
  stripeProductId: string;

  @Column()
  stripePriceId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
