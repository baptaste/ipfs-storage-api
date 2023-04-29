import { IpfsDataType } from './types';

export function formatIpfsAddResultToObject(ipfsAddResult: any) {
	return {
		path: ipfsAddResult.path,
		cid: ipfsAddResult.cid.toString(),
		size: ipfsAddResult.size,
	} as IpfsDataType;
}
