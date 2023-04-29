import ipfs from './config';
import { IpfsRetrieveResult } from './types';

export async function ipfsStore(data: any, ipfsPath?: string) {
	try {
		const buf = Buffer.from(JSON.stringify(data));
		const res = await ipfs.add(buf);
		console.log('ipfsStore - res:', res);
		if (res.cid) {
			// pin/persit data to ipfs
			await ipfs.pin.add(res.cid);
		}
		return res;
	} catch (err) {
		console.error('Error while uploading data to ipfs:', err);
		throw err;
	}
}

export async function ipfsRetrieve(cid: string): Promise<IpfsRetrieveResult> {
	try {
		const chunks = [];
		for await (const chunk of ipfs.cat(cid)) {
			chunks.push(chunk);
		}
		const decodedContent = new TextDecoder().decode(chunks[0]);
		return JSON.parse(decodedContent);
	} catch (err) {
		console.error('Error while retrieving data from ipfs:', err);
		throw err;
	}
}
