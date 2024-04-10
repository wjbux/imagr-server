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
		accessKeyId: 'AKIA5FTZCSHMPY577TAH',
		secretAccessKey: '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',
		bucket: 'unitaskr-image-gallery',
	},
	cors: [{ origin: 'http://localhost:4200' }],
};
