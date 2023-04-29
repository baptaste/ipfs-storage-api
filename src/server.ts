import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import express, { Express } from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/router';
import ipfs from './services/ipfs/config';

const PORT = process.env.PORT || 3500;
const URI = process.env.MANGO_CLUSTER_URI || '';

const app: Express = express();

const allowedOrigins: string[] = ['http://localhost:5173'];

const options: CorsOptions = {
	origin: allowedOrigins,
	credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(options));
app.use(router);

async function start() {
	mongoose
		.connect(URI, { autoIndex: true })
		.then(() => console.log(`------ Connected to mongodb cluster`))
		.catch((error) => console.error('Database connect error:', error));
}

app.listen(PORT, () => {
	console.log(`------ Server is live on http://localhost:${PORT}`);
	start();
	// console.log(ipfs.cat('QmfNGy5q8Q42SpD5zBvqL3gcDY3Nv7PNbbhWezTCah8bgH'));
});
