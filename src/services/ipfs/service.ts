import { CID } from "ipfs-http-client";
import ipfs from "./config";
import { IpfsRetrieveResult } from "./types";

export async function ipfsStore(data: any, ipfsPath?: string) {
	console.log("ipfsStore - data:", data);
	try {
		const buf = Buffer.from(JSON.stringify(data));
		console.log("ipfsStore - buf:", buf);
		const res = await ipfs.add(buf);
		console.log("ipfsStore - res:", res);
		if (res.cid) {
			// pin/persit data to ipfs
			await ipfs.pin.add(res.cid);
		}
		return res;
	} catch (err) {
		console.error("Error while uploading data to ipfs:", err);
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
		console.log("ipfsRetrieve - res:", JSON.parse(decodedContent));
		return JSON.parse(decodedContent);
	} catch (err) {
		console.error("Error while retrieving data from ipfs:", err);
		throw err;
	}
}

export async function ipfsDelete(cid: string): Promise<boolean | unknown> {
	let success = false;
	try {
		console.log("ipfsDelete CID string param", cid);
		// for await (const pinned of ipfs.pin.ls()) {
		// 	console.log("pinned item", pinned);
		// }
		// Unpin the content
		const unpinnedCID = await ipfs.pin.rm(cid);
		console.log("unpinnedCID", unpinnedCID);
		if (unpinnedCID) success = true;
		return success;
	} catch (err) {
		console.error("Error while deleting data from ipfs:", err);
		throw err;
	}
}
