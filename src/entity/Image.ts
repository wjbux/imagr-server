import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Album } from './Album';
/**
 * TypeORM Entity representing the image in each gallery
 */
@Entity()
export class Image extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	public name: string;

	@CreateDateColumn()
	public dateCreated: Date;

	@UpdateDateColumn()
	public dateUpdated: Date;

	@Column()
	public s3PutObjectUrl: string;

	@Column()
	public type: string;

	@Column()
	public size: string;

	@ManyToOne(() => Album, (album) => album.images, { nullable: true })
	public album?: Album;
}
