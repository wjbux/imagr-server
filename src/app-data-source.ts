import { DataSource } from 'typeorm';
import { environment } from '../environments/environment';
import { Album } from './entity/Album';
import { Image } from './entity/Image';

export const myDataSource = new DataSource({
	...environment.database,
	type: 'postgres',
	entities: [Image, Album],
	logging: true,
	synchronize: true,
});
