import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ApiProperty()
  @Column({ length: 500 })
  name: string;

  @ApiProperty()
  @Exclude()
  @Column({ length: 500 })
  password: string;

  @ApiProperty()
  @Column({ length: 500, default: null })
  avatar: string;

  @ApiProperty()
  @Column({ length: 500, default: null })
  email: string;

  @ApiProperty()
  @Column('simple-enum', { enum: ['admin', 'visitor'], default: 'visitor' })
  role: string;

  @ApiProperty()
  @Column('simple-enum', { enum: ['locked', 'active'], default: 'active' })
  status: string;

  @ApiProperty()
  @Column({ default: 'normal' })
  type: string;

  @ApiProperty()
  @CreateDateColumn({
    type: 'datetime',
    comment: 'create time',
    name: 'create_at',
  })
  createAt: Date;

  @ApiProperty()
  @UpdateDateColumn({
    type: 'datetime',
    comment: 'update time',
    name: 'update_at',
  })
  updateAt: Date;
}
