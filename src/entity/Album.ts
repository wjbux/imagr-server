import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Image } from './Image';
/**
 * TypeORM Entity representing an album of images
 */
@Entity()
export class Album extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	public name: string;

	@CreateDateColumn()
	public dateCreated: Date;

	@UpdateDateColumn()
	public dateUpdated: Date;

	@ManyToOne(() => Album, (album) => album.subAlbums, { nullable: true })
	public parentAlbum: Album;

	@OneToMany(() => Album, (album) => album.parentAlbum, { nullable: true })
	public subAlbums: Album[];

	@OneToMany(() => Image, (image) => image.album, { nullable: true })
	public images: Image[];
}
