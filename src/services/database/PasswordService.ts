import { formatPassword } from "../../helpers/formatters/password";
import { queryProjection } from "../../helpers/query";
import Password from "../../models/Password";
import { IpfsDataType } from "../ipfs/types";

export interface Password {
	_id: string;
	encryption_id: string;
	displayed_name: string;
	owner_id: string;
	created_at: string;
	image_url?: string;
	ipfs?: IpfsDataType;
	title?: string;
	updated_at?: string;
	website_url?: string;
}

export default class PasswordService {
	static create(
		userId: string,
		encryptionId: string,
		ipfsData: IpfsDataType,
		displayedName: string,
		title?: string,
		websiteUrl?: string,
		imageUrl?: string,
	): Promise<Password | null> {
		let data: any = {
			owner_id: userId,
			encryption_id: encryptionId,
			ipfs: ipfsData,
			displayed_name: displayedName,
		};
		if (title) data.title = title;
		if (websiteUrl) data.website_url = websiteUrl;
		if (imageUrl) data.image_url = imageUrl;

		return new Promise((resolve, reject) => {
			// check if password already exists
			PasswordService.getByEncryptionId(encryptionId)
				.then((record) => {
					if (record) {
						console.error(
							`PasswordService - item already exists with encryptionId ${encryptionId}`,
						);
						resolve(null);
					} else {
						Password.create(data)
							.then((password) => {
								console.log("PasswordService - create password success");
								resolve(formatPassword(password));
							})
							.catch((err) => {
								console.log("PasswordService - create password error:", err);
								reject(err);
							});
					}
				})
				.catch((err) => {
					console.log("PasswordService - create password error:", err);
					reject(err);
				});
		});
	}

	static getByEncryptionId(encryptionId: string, returnIpfs = false): Promise<Password | null> {
		// const ownerIdField: string = 'owner_id'
		return new Promise((resolve, reject) => {
			console.log("PasswordService - get password with encryptionId:", encryptionId);
			Password.findOne()
				.where("encryption_id")
				.equals(encryptionId)
				.select(queryProjection([{ field: "ipfs", include: returnIpfs }]))
				.then((password) => {
					console.log("PasswordService - getByEncryptionId, password:", password);
					resolve(password || null);
					// if (password !== null) resolve(password)
					// else reject('Password encryption_id does not exists')
				})
				.catch((err) => {
					console.log("PasswordService - get password error:", err);
					reject(err);
				});
		});
	}

	static getAll(userId: string): Promise<Password[]> {
		return new Promise((resolve, reject) => {
			Password.find()
				.where("owner_id")
				.equals(userId)
				.select("-ipfs") // doesnt return ipfs obj
				.then((passwords) => {
					console.log("PasswordService - get all passwords success");
					resolve(passwords);
				})
				.catch((err) => {
					console.log("PasswordService - get all passwords error:", err);
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
					console.log("PasswordService - update title success, updated:", password);
					resolve(formatPassword(password));
				})
				.catch((err) => {
					console.log("PasswordService - update title error:", err);
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
					console.log("PasswordService - updateLastModification success");
					resolve(formatPassword(password));
				})
				.catch((err) => {
					console.log("PasswordService - updateLastModification error:", err);
					reject(err);
				});
		});
	}

	static delete(encryptionId: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			Password.deleteOne()
				.where("encryption_id")
				.equals(encryptionId)
				.then((res) => {
					resolve(res.deletedCount === 1);
				})
				.catch((err) => {
					console.log("PasswordService - delete password error:", err);
					reject(err);
				});
		});
	}

	static async deleteAll(userId: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			PasswordService.count(userId)
				.then((passwordCount) => {
					console.log("PasswordService deleteAll - passwordCount:", passwordCount);

					Password.deleteMany()
						.then((res) => {
							console.log(
								"PasswordService deleteAll - res.deletedCount:",
								res.deletedCount,
							);
							resolve(res.deletedCount === passwordCount);
						})
						.catch((err) => {
							console.log("PasswordService - delete all passwords error:", err);
							reject(err);
						});
				})
				.catch((err) => {
					console.error("PasswordService count error:", err);
					reject(err);
				});
		});
	}

	static count(userId: string): Promise<number> {
		return new Promise((resolve, reject) => {
			Password.count()
				.where("owner_id")
				.equals(userId)
				.then((count) => {
					console.log("PasswordService - count success");
					resolve(count);
				})
				.catch((err) => {
					console.log("PasswordService - count error:", err);
					reject(err);
				});
		});
	}
}
