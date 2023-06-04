import express from 'express';
import { handleAuth } from '../middlewares/auth';
import { AuthController, PasswordController, UserController } from '../controllers';
import { v4 } from 'uuid';
// import IpfsService from '../services/ipfs/IpfsService';
import PasswordService from '../services/database/PasswordService';
import { ipfsRetrieve, ipfsStore } from '../services/ipfs/service';

const router = express.Router();

type ApiRoutes = {
	[key: string]: string;
};

const apiRoutes: ApiRoutes = {
	auth: '/api/auth',
	users: '/api/users',
	passwords: '/api/passwords',
};

//////////////////
// Auth routes //
//////////////////

// POST
router.post('/api/auth/login', (req, res) => new AuthController('login', req, res));
// GET
router.get(
	'/api/auth/password/:email',
	(req, res) => new AuthController('getMasterPassword', req, res),
);
router.get('/api/auth/logout', handleAuth, (req, res) => new AuthController('logout', req, res));
router.get(
	'/api/auth/refresh',
	handleAuth,
	(req, res) => new AuthController('refreshToken', req, res),
);

//////////////////
// Users routes //
//////////////////

// POST
router.post('/api/users/create', (req, res) => new UserController('createUser', req, res));

// GET

///// DEV ROUTE /////
router.get('/api/users', handleAuth, (req, res) => new UserController('getAll', req, res));
///// END DEV ROUTE /////

router.get('/api/users/:userId', handleAuth, (req, res) => new UserController('getUser', req, res));

// PATCH
router.patch(
	'/api/users/update/password',
	handleAuth,
	(req, res) => new UserController('changePassword', req, res),
);

// DELETE
router.delete(
	'/api/users/delete/:userId',
	handleAuth,
	(req, res) => new UserController('deleteUser', req, res),
);

//////////////////////
// Passwords routes //
//////////////////////

// POST
router.post(
	'/api/passwords/create',
	handleAuth,
	(req, res) => new PasswordController('createPassword', req, res),
);

router.post(
	'/api/passwords/retrieve',
	handleAuth,
	(req, res) => new PasswordController('retrievePassword', req, res),
);

// GET
router.get('/api/passwords', handleAuth, (req, res) => new PasswordController('getAll', req, res));

/** TODO
 // PATCH
router.patch(
	'/api/passwords/update',
	handleAuth,
	(req, res) => new PasswordController('updatePassword', req, res)
)

// DELETE
router.delete(
	'/api/passwords/delete',
	handleAuth,
	(req, res) => new PasswordController('deletePassword', req, res)
)

router.delete(
	'/api/passwords/deleteAll',
	handleAuth,
	(req, res) => new PasswordController('deleteAll', req, res)
)
 */

//////////////////////
// IPFS TEST routes //
//////////////////////
// router.post('/api/ipfs/store', async (req, res) => {
// 	console.log('/api/ipfs/store called');
// 	const { title, userId }
// 	const encryptionId = v4();
// 	try {
// 		// const cid = await IpfsService.store(encryptionId, req.body.plaintext)
// 		const data = { encryptionId, encrypted: req.body.plaintext };
// 		const ipfsResult = await ipfsStore(data);
// 		if (ipfsResult.cid) {
// 			await PasswordService.create()
// 		}
// 		// console.log('ipfs store, cid:', cid)
// 		res.status(200).json({ success: true, data: ipfsResult });
// 	} catch (err) {
// 		console.error('ipfs store error:', err);
// 		res.status(200).json({ success: false, err });
// 	}
// });

// router.get('/api/ipfs/retrieve', async (req: any, res) => {
// 	console.log('/api/ipfs/retrieve called');
// 	try {
// 		const passwordRecord = await PasswordService.getByEncryptionId(req.encryptionId);
// 		if (passwordRecord && passwordRecord.ipfs) {
// 			// const data = await IpfsService.retrieve(passwordRecord.ipfs.cid);
// 			const data = await ipfsRetrieve(passwordRecord.ipfs.cid);
// 			console.log('ipfs retrieve, data:', data);
// 			res.status(200).json({ success: true, data });
// 		}
// 	} catch (err) {
// 		console.error('ipfs retrieve error:', err);
// 		res.status(200).json({ success: false, err });
// 	}
// });

export default router;
