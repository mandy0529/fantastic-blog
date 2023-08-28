import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class SMTP {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'text', default: null })
  from: string;

  @ApiProperty()
  @Column({ type: 'text', default: null })
  to: string;

  @ApiProperty()
  @Column({ type: 'text', default: null })
  subject: string;

  @ApiProperty()
  @Column({ type: 'text', default: null })
  text: string;

  @ApiProperty()
  @Column({ type: 'text', default: null })
  html: string;

  @ApiProperty()
  @CreateDateColumn({
    type: 'datetime',
    comment: 'create time',
    name: 'create_at',
  })
  createAt: Date;
}
