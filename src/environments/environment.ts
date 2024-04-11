export const environment = {
	database: {
		databaseURL: 'http://localhost:3000',
		host: 'localhost',
		port: 5432,
		username: 'postgres',
		password: 'admin',
		database: 'postgres',
	},
	s3: {
		region: 'eu-north-1',
		accessKeyId: '',
		secretAccessKey: '',
		bucket: '',
	},
	cors: [{ origin: 'http://localhost:4200' }],
};
