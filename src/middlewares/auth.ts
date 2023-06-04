import { Request, Response, NextFunction } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { verifyToken, VerifyTokenResult } from '../helpers/token';

const accessTokenRoutes: string[] = [
	'/api/users/:userId',
	'/api/users/delete/:userId',
	'/api/passwords',
	'/api/passwords/create',
	'/api/passwords/retrieve',
	'/api/passwords/update',
	'/api/passwords/delete',
	'/api/passwords/deleteAll',
];

function sendAuthResult(
	result: VerifyTokenResult,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (result instanceof TokenExpiredError) {
		return res.status(403).json({ success: false, message: 'Token expired' });
	} else if (result instanceof JsonWebTokenError) {
		return res.status(403).json({ success: false, message: result });
	}

	req.user = result;
	next();
}

export function handleAuth(req: Request, res: Response, next: NextFunction) {
	console.log('handleAuth - req.route.path:', req.route.path);

	let token: string | null = null;

	const needAccess: boolean = accessTokenRoutes.includes(req.route.path);

	const secretKey = needAccess
		? (process.env.ACCESS_TOKEN_SECRET as string)
		: (process.env.REFRESH_TOKEN_SECRET as string);

	if (needAccess) {
		const authHeader = req.headers.authorization;
		if (authHeader) {
			token = authHeader.split(' ')[1];
			console.log('handleAuth - access token:', token);
		}
	} else if (req.cookies.refresh_token) {
		token = req.cookies.refresh_token;
		console.log('handleAuth - refresh token:', token);
	}

	if (token === null) {
		return res.status(401).json({
			success: false,
			message: `Unauthorized - No ${
				needAccess ? 'access' : 'refresh'
			} token found in headers`,
		});
	}

	const result = verifyToken(token, secretKey);
	console.log('handleAuth - result:', result);
	sendAuthResult(result, req, res, next);
}
