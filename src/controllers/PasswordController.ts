import { AppController } from './AppController';
import { Request, Response } from 'express';
import PasswordService from '../services/database/PasswordService';
import { v4 as uuid } from 'uuid';
import { ipfsRetrieve, ipfsStore } from '../services/ipfs/service';
import { formatIpfsObject } from '../helpers/formatters/ipfs';
import { getFaviconURL } from '../helpers/favicons';

// import IpfsService from '../services/ipfs/IpfsService'

export class PasswordController extends AppController {
	userId?: string;
	[method: string]: any;

	constructor(private method: string, private req: Request, private res: Response) {
		super();

		if (!req.user.userId) {
			this.unauthorized(res, 'auth user id is required');
		} else {
			this.userId = req.user.userId;
			this.execute(req, res);
		}
	}

	protected async handler(req: Request, res: Response): Promise<void | any> {
		try {
			// handle requests, given through constructor in router
			await this[this.method](req, res);
		} catch (err: any) {
			console.error('PasswordController - handler err:', err);
			return this.serverError(res, err.toString());
		}
	}

	private checkOwner(res: Response, passwordRecord: any) {
		if (!this.userId) return;

		if (passwordRecord.owner_id.toString() !== this.userId) {
			return this.unauthorized(res, `User with id ${this.userId} is not the owner`);
		}
	}

	public async getAll(_: any, res: Response) {
		if (!this.userId) return;

		const passwords = await PasswordService.getAll(this.userId);

		if (passwords) {
			this.ok(res, { success: true, passwords });
		}
	}

	public async createPassword(req: Request, res: Response) {
		if (!this.userId) return;

		const { password, vector, title, websiteUrl } = req.body;
		let imageUrl = undefined;

		if (!password) return this.clientError(res, 'Password is required.');
		if (!vector) return this.clientError(res, 'Password is required.');
		if (!title && !websiteUrl) {
			return this.clientError(res, 'Either a title or associated website url is required.');
		}

		// Create random uuid for the new password
		const encryptionId = uuid();
		// all data obj goes to ipfs, never stored into db
		const data = {
			encrypted: password as Uint8Array,
			vector: vector as Uint8Array,
		};

		const ipfsResult = await ipfsStore(data);

		if (ipfsResult.cid) {
			console.log('createPassword - ipfsResult:', ipfsResult);
			const ipfsData = formatIpfsObject(ipfsResult);
			if (websiteUrl) {
				imageUrl = await getFaviconURL(websiteUrl);
			}
			// Create password in db
			const newPassword = await PasswordService.create(
				this.userId,
				encryptionId,
				ipfsData,
				title,
				websiteUrl,
				imageUrl,
			);

			if (!newPassword) {
				// DB Error
				return this.ok(res, {
					success: false,
					password: null,
					message: 'An error occurred while storing your password',
				});
			}

			this.ok(res, { success: true, password: newPassword });
		}
	}

	public async retrievePassword(req: Request, res: Response) {
		if (!this.userId) return;
		const { encryptionId } = req.body;
		if (!encryptionId) {
			return this.unauthorized(res, 'password encryption id is required');
		}
		const passwordRecord = await PasswordService.getByEncryptionId(
			encryptionId,
			true, // access ipfs obj key
		);
		if (passwordRecord && passwordRecord.ipfs) {
			this.checkOwner(res, passwordRecord);
			const ipfsResult = await ipfsRetrieve(passwordRecord.ipfs.cid);
			console.log('retrievePassword - ipfsResult', ipfsResult);
			if (ipfsResult) {
				this.ok(res, { success: true, data: ipfsResult });
			}
		}
	}

	// public async createPassword(req: Request, res: Response) {
	// 	if (!this.userId) return;

	// 	const { title, password }: Record<string, string> = req.body;

	// 	if (!title) return this.clientError(res, 'Title is required.');

	// 	if (!password) return this.clientError(res, 'Password is required.');

	// 	const encryptionKey = await UserService.getEncryptionKey(this.userId);

	// 	if (encryptionKey) {
	// 		// Encrypts new password with user encryption key
	// 		const encryptedPassword = encryptData(password, encryptionKey);
	// 		// Create random uuid for the new password
	// 		const encryptionId = uuid();

	// 		// const ipfsCID = await IpfsService.store(encryptionId, encryptedPassword)
	// 		const data = { encryptionId, encrypted: encryptedPassword };
	// 		const ipfsResult = await ipfsStore(data);

	// 		if (ipfsResult.cid) {
	// 			console.log('createPassword - ipfsResult:', ipfsResult);
	// 			const ipfsData = formatIpfsObject(ipfsResult);
	// 			// Create password in db
	// 			const newPassword = await PasswordService.create(title, this.userId, encryptionId, ipfsData);

	// 			if (!newPassword) {
	// 				// DB Error
	// 				return this.ok(res, {
	// 					success: false,
	// 					password: null,
	// 					message: 'An error occurred while storing your password',
	// 				});
	// 			}

	// 			this.ok(res, { success: true, password: newPassword });
	// 		}
	// 	}
	// }

	// public async retrievePassword(req: Request, res: Response) {
	// 	if (!this.userId) return;

	// 	const { encryptionId } = req.body;

	// 	if (!encryptionId) {
	// 		return this.unauthorized(res, 'password encryption id is required');
	// 	}

	// 	const passwordRecord = await PasswordService.getByEncryptionId(encryptionId);

	// 	if (passwordRecord && passwordRecord.ipfs) {
	// 		this.checkOwner(res, passwordRecord);

	// 		// const ipfsResponse = await IpfsService.retrieve(passwordRecord.ipfs.cid);
	// 		const ipfsResult = await ipfsRetrieve(passwordRecord.ipfs.cid);

	// 		if (ipfsResult) {
	// 			const encryptionKey = await UserService.getEncryptionKey(this.userId);

	// 			if (encryptionKey) {
	// 				const plaintextPassword = decryptData(ipfsResult.encrypted, encryptionKey);
	// 				this.ok(res, { success: true, decrypted: plaintextPassword });
	// 			}
	// 		}
	// 	}
	// }

	// public async updatePassword(req: Request, res: Response) {
	// 	if (!this.userId) return

	// 	const { encryptionId, title, password } = req.body

	// 	if (!encryptionId) {
	// 		return this.unauthorized(res, 'password encryption id is required')
	// 	}

	// 	if (!title && !password) {
	// 		return this.clientError(res, 'Either a title or password is required.')
	// 	}

	// 	const passwordRecord = await PasswordService.getByEncryptionId(encryptionId)

	// 	if (passwordRecord) {
	// 		this.checkOwner(res, passwordRecord)

	// 		// Title update
	// 		if (!password && title) {
	// 			return this.titleUpdate(res, encryptionId, title)
	// 		}

	// 		// Password update
	// 		if (!title && password) {
	// 			return this.encryptionUpdate(res, encryptionId, password)
	// 		}

	// 		// Both title and password update
	// 		if (title && password) {
	// 			return this.completeUpdate(res, encryptionId, title, password)
	// 		}
	// 	}
	// }

	// private async titleUpdate(res: Response, encryptionId: string, title: string) {
	// 	if (!this.userId) return

	// 	const updatedPassword = await PasswordService.update(this.userId, encryptionId, title)

	// 	if (updatedPassword) {
	// 		return this.ok(res, {
	// 			success: true,
	// 			password: updatedPassword,
	// 			updateType: 'title'
	// 		})
	// 	}
	// }

	// private async encryptionUpdate(res: Response, encryptionId: string, password: string) {
	// 	if (!this.userId) return

	// 	const encryptionKey = await UserService.getEncryptionKey(this.userId)

	// 	if (encryptionKey) {
	// 		const encrypted = encryptData(password, encryptionKey)

	// 		const contractUpdateSuccess = await ContractService.update(encryptionId, encrypted)

	// 		if (contractUpdateSuccess) {
	// 			const updatedPassword = await PasswordService.updateLastModification(this.userId, encryptionId)

	// 			return this.ok(res, {
	// 				success: true,
	// 				contractUpdated: contractUpdateSuccess,
	// 				password: updatedPassword,
	// 				updateType: 'password'
	// 			})
	// 		}
	// 	}
	// }

	// private async completeUpdate(res: Response, encryptionId: string, title: string, password: string) {
	// 	if (!this.userId) return

	// 	// update password db title
	// 	const updatedPassword = await PasswordService.update(this.userId, encryptionId, title)

	// 	// update password in contract
	// 	if (updatedPassword) {
	// 		const encryptionKey = await UserService.getEncryptionKey(this.userId)

	// 		if (encryptionKey) {
	// 			const encrypted = encryptData(password, encryptionKey)

	// 			const contractUpdateSuccess = await ContractService.update(encryptionId, encrypted)

	// 			if (contractUpdateSuccess) {
	// 				return this.ok(res, {
	// 					success: true,
	// 					contractUpdated: contractUpdateSuccess,
	// 					password: updatedPassword,
	// 					updateType: 'all'
	// 				})
	// 			}
	// 		}
	// 	}
	// }

	// public async deletePassword(req: Request, res: Response) {
	// 	if (!this.userId) return

	// 	const { encryptionId } = req.body

	// 	if (!encryptionId) {
	// 		return this.unauthorized(res, 'password encryption id is required')
	// 	}

	// 	const passwordRecord = await PasswordService.getByEncryptionId(encryptionId)

	// 	if (passwordRecord) {
	// 		this.checkOwner(res, passwordRecord)

	// 		const contractSuccess = await ContractService.delete(passwordRecord.encryption_id)

	// 		if (contractSuccess) {
	// 			const dbSuccess = await PasswordService.delete(passwordRecord.encryption_id)

	// 			if (dbSuccess) {
	// 				this.ok(res, { success: true, deleted: true })
	// 			}
	// 		}
	// 	}
	// }

	// public async deleteAll(_: any, res: Response) {
	// 	if (!this.userId) return

	// 	const contractSuccess = await ContractService.deleteAll()

	// 	if (contractSuccess) {
	// 		const dbSuccess = await PasswordService.deleteAll(this.userId)

	// 		if (dbSuccess) {
	// 			this.ok(res, { success: true, allDeleted: true })
	// 		}
	// 	}
	// }
}
