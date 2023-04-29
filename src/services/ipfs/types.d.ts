export interface IpfsDataType {
	cid: string;
	size: number;
	path: string;
}

export interface IpfsRetrieveResult {
	encryptionId: string;
	encrypted: string;
}
