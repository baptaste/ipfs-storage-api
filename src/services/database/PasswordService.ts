import Password from '../../models/Password';
import { IpfsDataType } from '../ipfs/types';

export interface Password {
	_id: string;
	owner_id: string;
	title: string;
	encryption_id: string;
	ipfs: IpfsDataType;
	created_at: string;
	updated_at?: string;
}

export default class PasswordService {
	static create(title: string, userId: string, encryptionId: string, ipfsData: IpfsDataType): Promise<Password | null> {
		return new Promise((resolve, reject) => {
			// check if password already exists
			PasswordService.getByEncryptionId(encryptionId)
				.then((record) => {
					if (record) {
						console.error(`PasswordService - item already exists with encryptionId ${encryptionId}`);
						resolve(null);
					} else {
						Password.create({
							title,
							owner_id: userId,
							encryption_id: encryptionId,
							ipfs: ipfsData,
						})
							.then((password) => {
								console.log('PasswordService - create password success');
								resolve(password);
							})
							.catch((err) => {
								console.log('PasswordService - create password error:', err);
								reject(err);
							});
					}
				})
				.catch((err) => {
					console.log('PasswordService - create password error:', err);
					reject(err);
				});
		});
	}

	static getByEncryptionId(encryptionId: string): Promise<Password | null> {
		// const ownerIdField: string = 'owner_id'
		return new Promise((resolve, reject) => {
			console.log('PasswordService - get password with encryptionId:', encryptionId);
			Password.findOne()
				.where('encryption_id')
				.equals(encryptionId)
				.then((password) => {
					console.log('PasswordService - getByEncryptionId, password:', password);
					resolve(password);
					// if (password !== null) resolve(password)
					// else reject('Password encryption_id does not exists')
				})
				.catch((err) => {
					console.log('PasswordService - get password error:', err);
					reject(err);
				});
		});
	}

	static getAll(userId: string): Promise<Password[]> {
		return new Promise((resolve, reject) => {
			Password.find()
				.where('owner_id')
				.equals(userId)
				.then((passwords) => {
					console.log('PasswordService - get all passwords success');
					resolve(passwords);
				})
				.catch((err) => {
					console.log('PasswordService - get all passwords error:', err);
					reject(err);
				});
		});
	}

	static update(userId: string, encryptionId: string, newTitle: string): Promise<Password> {
		const filter = { owner_id: userId, encryption_id: encryptionId };
		const update = { title: newTitle, updated_at: Date.now() };
		const options = { new: true }; // return updated doc

		return new Promise((resolve, reject) => {
			Password.findOneAndUpdate(filter, update, options)
				.then((password) => {
					console.log('PasswordService - update title success, updated:', password);
					resolve(password);
				})
				.catch((err) => {
					console.log('PasswordService - update title error:', err);
					reject(err);
				});
		});
	}

	static updateLastModification(userId: string, encryptionId: string): Promise<Password> {
		const filter = { owner_id: userId, encryption_id: encryptionId };
		const update = { updated_at: Date.now() };
		const options = { new: true };

		return new Promise((resolve, reject) => {
			Password.findOneAndUpdate(filter, update, options)
				.then((password) => {
					console.log('PasswordService - updateLastModification success');
					resolve(password);
				})
				.catch((err) => {
					console.log('PasswordService - updateLastModification error:', err);
					reject(err);
				});
		});
	}

	static delete(encryptionId: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			Password.deleteOne()
				.where('encryption_id')
				.equals(encryptionId)
				.then((res) => {
					resolve(res.deletedCount === 1);
				})
				.catch((err) => {
					console.log('PasswordService - delete password error:', err);
					reject(err);
				});
		});
	}

	static async deleteAll(userId: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			PasswordService.count(userId)
				.then((passwordCount) => {
					console.log('PasswordService deleteAll - passwordCount:', passwordCount);

					Password.deleteMany()
						.then((res) => {
							console.log('PasswordService deleteAll - res.deletedCount:', res.deletedCount);
							resolve(res.deletedCount === passwordCount);
						})
						.catch((err) => {
							console.log('PasswordService - delete all passwords error:', err);
							reject(err);
						});
				})
				.catch((err) => {
					console.error('PasswordService count error:', err);
					reject(err);
				});
		});
	}

	static count(userId: string): Promise<number> {
		return new Promise((resolve, reject) => {
			Password.count()
				.where('owner_id')
				.equals(userId)
				.then((count) => {
					console.log('PasswordService - count success');
					resolve(count);
				})
				.catch((err) => {
					console.log('PasswordService - count error:', err);
					reject(err);
				});
		});
	}
}
