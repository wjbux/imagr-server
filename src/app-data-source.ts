import { DataSource } from 'typeorm';
import { Album } from './entity/Album';
import { Image } from './entity/Image';
import { environment } from './environments/environment';

export const myDataSource = new DataSource({
	...environment.database,
	type: 'postgres',
	entities: [Image, Album],
	logging: true,
	synchronize: true,
});
