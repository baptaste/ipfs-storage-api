// // import { CIDString, Web3File, Web3Response } from 'web3.storage'
// import { toFileArray } from '../../helpers/file'
// // import { getWeb3StorageClient } from './config'
// import ipfs from './config'
// import { IpfsAddResult } from './types'
// // const client = getWeb3StorageClient()

// export default class IpfsService {
// 	static store(encryptionId: string, data: any): Promise<IpfsAddResult | null> {
// 		console.log('IpfsService - store - data to be stored:', data)
// 		return new Promise((resolve, reject) => {
// 			const entry = Buffer.from(JSON.stringify({ encryptionId, data }))

// 			ipfs.add(entry)
// 				.then((res) => {
// 					console.log('IpfsService - add res:', res)
// 					if (res) {
// 						// persist data to ipfs
// 						ipfs.pin.add(res.cid).then(() => {
// 							resolve(res)
// 						})
// 					} else {
// 						resolve(null)
// 					}
// 				})
// 				.catch((err) => {
// 					console.error('IpfsService - store error:', err)
// 					reject(err)
// 				})
// 		})
// 	}

// 	static retrieve(cid: string): Promise<any | null> {
// 		return new Promise((resolve, reject) => {
// 			const dataStream = ipfs.get(cid)
// 		})
// 	}
// }

// export default class IpfsService {
// 	static store(encryptionId: string, encrypted: string): Promise<CIDString | null> {
// 		console.log('IpfsService - store called')
// 		return new Promise((resolve, reject) => {
// 			const data = toFileArray({ encryptionId, encrypted })
// 			console.log('IpfsService - data to be stored:', data)

// 			client
// 				.put(data)
// 				.then((cid: CIDString) => {
// 					console.log('IpfsService - stored data cid:', cid)
// 					if (cid) {
// 						resolve(cid)
// 					} else {
// 						resolve(null)
// 					}
// 				})
// 				.catch((err) => {
// 					console.error('IpfsService - store error:', err)
// 					reject(err)
// 				})
// 		})
// 	}

// 	static retrieve(cid: CIDString): Promise<any | null> {
// 		return new Promise((resolve, reject) => {
// 			client
// 				.get(cid)
// 				.then((res: Web3Response | null) => {
// 					console.log('IpfsService - retrieve res:', res)
// 					if (!res) {
// 						resolve(null)
// 						return
// 					}
// 					res.files()
// 						.then((files) => {
// 							const blob = files[0]
// 							new Response(blob).text().then((data: any) => {
// 								console.log('IpfsService - retrieve success, data:', data)
// 								resolve(JSON.parse(data))
// 							})
// 						})
// 						.catch((err) => {
// 							console.error('IpfsService - store error:', err)
// 							reject(err)
// 						})
// 				})
// 				.catch((err) => {
// 					console.error('IpfsService - store error:', err)
// 					reject(err)
// 				})
// 		})
// 	}
// }
