import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as cors from 'cors';
import * as express from 'express';
import { Request, Response } from 'express';
import { FindOptionsOrderValue, Like } from 'typeorm';
import { environment } from '../environments/environment';
import { myDataSource } from './app-data-source';
import { Album } from './entity/Album';
import { Image } from './entity/Image';

const DEFAULT_RESULT_LIMIT: number = 50;

// Establish database connection
myDataSource
	.initialize()
	.then(() => {
		console.log('Data Source has been initialized!');
	})
	.catch((err) => {
		console.error('Error during Data Source initialization:', err);
	});

// Initialise S3 client
const s3: S3Client = new S3Client({
	region: environment.s3.region,
	credentials: {
		accessKeyId: environment.s3.accessKeyId,
		secretAccessKey: environment.s3.secretAccessKey,
	},
});

// create and setup express app
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// CORS settings
environment.cors.forEach((corsUrl) => app.use(cors(corsUrl)));

// Register REST API routes

// Create an album
app.post('/albums', async function (req: Request, res: Response) {
	try {
		const albums: Album[] = myDataSource.getRepository(Album).create(req.body);
		const results: Album[] = await myDataSource.getRepository(Album).save(albums);

		return res.send(results);
	} catch (e) {
		console.error(e);
	}
});

// Read all albums
app.get('/albums', async function (req: Request, res: Response) {
	try {
		const albums: Album[] = await myDataSource
			.getRepository(Album)
			.find({ take: parseInt(req.query.limit as string) || DEFAULT_RESULT_LIMIT });
		res.json(albums);
	} catch (e) {
		console.error(e);
	}
});

// Read album by ID
app.get('/albums/:id', async function (req: Request, res: Response) {
	try {
		const album: Album = await myDataSource.getRepository(Album).findOneBy({
			id: Number(req.params.id),
		});
		return res.send(album);
	} catch (e) {
		console.error(e);
	}
});

// Update album by ID
app.put('/albums/:id', async function (req: Request, res: Response) {
	try {
		const album: Album = await myDataSource.getRepository(Album).findOneBy({
			id: Number(req.params.id),
		});
		myDataSource.getRepository(Album).merge(album, req.body);
		const result: Album = await myDataSource.getRepository(Album).save(album);
		return res.send(result);
	} catch (e) {
		console.error(e);
	}
});

// Delete album by ID
app.delete('/albums/:id', async function (req: Request, res: Response) {
	try {
		const album: Album = await myDataSource.getRepository(Album).findOneBy({ id: Number(req.params.id) });
		const images: Image[] = await myDataSource.getRepository(Image).findBy({ album: album });

		for (let image of images) {
			const command = new DeleteObjectCommand({
				Bucket: environment.s3.bucket,
				Key: `${image.dateCreated}.${image.type}`,
			});
			await s3.send(command);
		}

		await myDataSource.getRepository(Image).remove(images);
		const results: Album = await myDataSource.getRepository(Album).remove(album);
		return res.send(results);
	} catch (e) {
		console.error(e);
	}
});

// Create an image
app.post('/images', async function (req: Request, res: Response) {
	try {
		const upload: Upload = new Upload({
			client: s3,
			params: {
				Bucket: environment.s3.bucket,
				Key: `${Date.now()}_${req.body.image.name}`,
				Body: dataURLtoFile(req.body.file, req.body.image.name),
			},
		});

		const imageUrl: string = (await upload.done()).Location;
		const image: Image[] = myDataSource
			.getRepository(Image)
			.create({ ...req.body.image, s3PutObjectUrl: imageUrl });
		const results: Image[] = await myDataSource.getRepository(Image).save(image);

		return res.send(results);
	} catch (e) {
		console.error(e);
	}
});

// Read images by album ID
app.get('/albums/:id/images', async function (req: Request, res: Response) {
	try {
		const query = req.query;
		const sort = query.sort ? { dateCreated: query.sort as FindOptionsOrderValue } : {};
		const search = query.search ? { name: Like(`%${query.search}%`) } : {};
		const images = await myDataSource.getRepository(Image).find({
			where: { album: { id: Number(req.params.id) }, ...search },
			order: { ...sort },
			take: Number(query.limit) || 10,
		});

		return res.send(images);
	} catch (e) {
		console.error(e);
	}
});

// Read image by ID
app.get('/images/:id', async function (req: Request, res: Response) {
	try {
		const image: Image = await myDataSource.getRepository(Image).findOneBy({
			id: Number(req.params.id),
		});
		return res.send(image);
	} catch (e) {
		console.error(e);
	}
});

// Update image by ID
app.put('/images/:id', async function (req: Request, res: Response) {
	try {
		const image: Image = await myDataSource.getRepository(Image).findOneBy({
			id: Number(req.params.id),
		});
		myDataSource.getRepository(Image).merge(image, req.body);
		const results = await myDataSource.getRepository(Image).save(image);
		return res.send(results);
	} catch (e) {
		console.error(e);
	}
});

// Delete image by ID
app.delete('/images/:id', async function (req: Request, res: Response) {
	try {
		const image: Image = await myDataSource.getRepository(Image).findOneBy({
			id: Number(req.params.id),
		});

		const command: DeleteObjectCommand = new DeleteObjectCommand({
			Bucket: environment.s3.bucket,
			Key: `${image.dateCreated}.${image.type}`,
		});
		await s3.send(command);

		const results: Image = await myDataSource.getRepository(Image).remove(image);

		return res.send(results);
	} catch (e) {
		console.error(e);
	}
});

// start express server on port 3000
app.listen(3000);

/**
 * Converts a data URL string to a file object
 * @param dataurl dataURL string
 * @param filename name of file to create
 * @returns file object
 */
function dataURLtoFile(dataurl, filename) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[arr.length - 1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime });
}
