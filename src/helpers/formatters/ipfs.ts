import { IpfsDataType } from '../../services/ipfs/types';

export function formatIpfsObject(ipfsAddResult: any) {
	return {
		path: ipfsAddResult.path,
		cid: ipfsAddResult.cid.toString(),
		size: ipfsAddResult.size,
	} as IpfsDataType;
}
