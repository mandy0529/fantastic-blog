import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  static comparePassword(writtenPassword, originalPassword) {
    return bcrypt.compareSync(writtenPassword, originalPassword);
  }

  static hashPassword(password) {
    return bcrypt.hashSync(password, 10);
  }

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

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 10);
  }
}
