export interface IpfsDataType {
	cid: string;
	size: number;
	path: string;
}

export interface IEncryptedData {
	encrypted: Uint8Array;
	vector: Uint8Array;
}
