// import { Web3Storage } from 'web3.storage'

// export function getWeb3StorageClient() {
// 	return new Web3Storage({ token: process.env.WEB3_STORAGE_API_KEY as string })
// }

import * as ipfsClient from 'ipfs-http-client';

const { INFURA_IPFS_API_KEY, INFURA_IPFS_API_SECRET_KEY } = process.env;
const projectId = INFURA_IPFS_API_KEY as string;
const projectSecret = INFURA_IPFS_API_SECRET_KEY as string;
const authHeader = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfs = ipfsClient.create({
	host: 'ipfs.infura.io',
	port: 5001,
	protocol: 'https',
	headers: {
		Authorization: authHeader,
	},
});

export default ipfs;
