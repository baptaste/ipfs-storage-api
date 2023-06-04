import { AppController } from './AppController';
import { Request, Response } from 'express';
import { encryptData, generateCSPRNG } from '../helpers/crypto';
import { hash } from '../helpers/hash';
import UserService from '../services/database/UserService';
import PasswordService from '../services/database/PasswordService';
import AuthService from '../services/database/AuthService';

export class UserController extends AppController {
	private readonly createUserRoute: string = '/api/users/create';
	userId?: string;
	[method: string]: any;

	constructor(private method: string, private req: Request, private res: Response) {
		super();

		if (req.route.path !== this.createUserRoute) {
			if (!req.user.userId) {
				this.unauthorized(res, 'auth user id is required');
			} else {
				this.userId = req.user.userId;
				this.execute(req, res);
			}
		} else {
			this.execute(req, res);
		}
	}

	protected async handler(req: Request, res: Response): Promise<void | any> {
		try {
			// handle requests, given through constructor in router
			await this[this.method](req, res);
		} catch (err: any) {
			console.error('UserController - handler err:', err);
			return this.serverError(res, err.toString());
		}
	}

	private checkRequestUserId() {
		if (!this.req.params.userId) {
			return this.unauthorized(this.res, 'userId is required');
		}

		if (this.userId !== this.req.params.userId) {
			return this.unauthorized(this.res, 'invalid userId param');
		}
	}

	public async createUser(req: Request, res: Response) {
		const { email, password, preferences } = req.body;

		if (!email) return this.clientError(res, 'Email is required.');
		if (!password) return this.clientError(res, 'Password is required.');
		if (!preferences) return this.clientError(res, 'user preferences is required');

		const newUser = await UserService.create(email, password, preferences);
		console.log('UserController createUser - newUser:', newUser);

		if (newUser) this.ok(res, { success: newUser !== null, user: newUser });

		// // generate random user-key
		// const randomUserKey = generateCSPRNG(256)

		// // derive password-key from user password
		// const derivedPasswordKey = await hash(plaintext)

		// if (derivedPasswordKey) {
		// 	// encrypt user-key with derived password-key
		// 	const encryptionKey = encryptData(randomUserKey, derivedPasswordKey)

		// 	const newUser = await UserService.create(email, derivedPasswordKey, encryptionKey, preferences)

		// 	console.log('UserController createUser - newUser:', newUser)

		// 	if (newUser) {
		// 		this.ok(res, { success: newUser !== null, user: newUser })
		// 	}
		// }
	}

	public async getUser(_: any, res: Response) {
		if (!this.userId) return;
		this.checkRequestUserId();

		const userRecord = await UserService.getById(this.userId);

		this.ok(res, { success: userRecord !== null, user: userRecord });
	}

	public async getAll(_: any, res: Response) {
		if (!this.isDev) {
			return this.forbidden(
				this.res,
				'this route is only accessible in development environment',
			);
		}

		const usersRecord = await UserService.getAll();

		if (usersRecord) {
			this.ok(res, { success: true, users: usersRecord });
		}
	}

	/*
	TODO move process into client
	*/
	// public async changePassword(req: Request, res: Response) {
	// 	if (!this.userId) return;

	// 	const { plaintext } = req.body;

	// 	if (!plaintext) {
	// 		return this.clientError(res, 'A password is required.');
	// 	}

	// 	// derive new password-key from new user password
	// 	const newDerivedPasswordKey = await hash(plaintext);
	// 	console.log('UserController changePassword - new password key :', newDerivedPasswordKey);

	// 	// get old encryption key decrypted from user record on db
	// 	const oldEncryptionKey = await UserService.getEncryptionKey(this.userId);
	// 	console.log('UserController changePassword - old encryption key:', oldEncryptionKey);

	// 	// encrypt same old encryption key with new derived password-key
	// 	if (newDerivedPasswordKey && oldEncryptionKey) {
	// 		const newEncryptionKey = encryptData(oldEncryptionKey, newDerivedPasswordKey);
	// 		console.log('UserController changePassword - new encryption key:', newEncryptionKey);

	// 		const updatedUser = await UserService.update(this.userId, {
	// 			password_key: newDerivedPasswordKey,
	// 			encryption_key: newEncryptionKey,
	// 		});

	// 		console.log('UserController changePassword - updatedUser:', updatedUser);

	// 		if (updatedUser) {
	// 			this.ok(res, { success: true, user: updatedUser });
	// 		}
	// 	}
	// }

	public async deleteUser(_: any, res: Response) {
		if (!this.userId) return;
		this.checkRequestUserId();

		//TODO delete all ipfs data
		const totalPasswords = await PasswordService.count(this.userId);

		if (totalPasswords >= 1) {
			await PasswordService.deleteAll(this.userId);
		}

		const userDeleted = await UserService.delete(this.userId);
		console.log('UserService, deleteUser - userDeleted:', userDeleted);
		await AuthService.deleteRefreshToken(this.userId);
		res.clearCookie('refresh_token');
		this.ok(res, { success: userDeleted, deleted: userDeleted });
	}
}
