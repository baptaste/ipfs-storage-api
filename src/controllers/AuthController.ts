import { AppController } from './AppController'
import { Request, Response } from 'express'
import { cookieOptions } from '../helpers/cookie'
import { generateToken, TokenPayload } from '../helpers/token'
import AuthService from '../services/database/AuthService'
import UserService from '../services/database/UserService'

export type AuthUser = {
	_id?: string
	email?: string
	plaintext?: string
	password_key?: string
	created_at?: string
}

export class AuthController extends AppController {
	user?: AuthUser;
	[method: string]: any

	constructor(private method: string, private req: Request, private res: Response) {
		super()
		this.execute(req, res)
	}

	protected async handler(req: Request, res: Response): Promise<void | any> {
		try {
			console.log('AuthController handler - calling ' + this.method)
			// handle requests, given through constructor in router
			await this[this.method](req, res)
		} catch (err: any) {
			console.error('AuthController - handler err:', err)
			return this.serverError(res, err.toString())
		}
	}

	/**
	 * Log in user by checking credentials and generating access and refresh tokens
	 * @returns void
	 */

	public async login(req: Request, res: Response) {
		console.log('AuthController - login called')
		const { email, plaintext } = req.body

		if (!email) return this.clientError(res, 'Email is required.')
		if (!plaintext) return this.clientErrorr(res, 'Password is require.d')

		const userRecord = await UserService.getByField('email', email, true)

		if (!userRecord) {
			return this.clientError(res, 'This email does not exists or is not valid.')
		}

		this.user = {
			...JSON.parse(JSON.stringify(userRecord)),
			plaintext
		}

		const passwordVerified = await this.verifyPassword()

		if (!passwordVerified) {
			return this.clientError(res, 'Invalid credentials. Please check your email or password.')
		}

		const accessToken = await this.generateToken(req, res)

		this.ok(res, {
			success: true,
			user: {
				_id: userRecord._id,
				email: userRecord.email,
				preferences: userRecord.preferences
			},
			accessToken
		})
	}

	/**
	 * Verify user password hash with plaintext payload
	 * using argon2's verify method to compare values
	 * @returns boolean
	 */

	private async verifyPassword(): Promise<boolean> {
		console.log('AuthController - verifyPassword called')

		if (this.user?.plaintext && this.user.password_key) {
			return await UserService.verifyMasterPassword(this.user.password_key, this.user.plaintext)
		}

		return false
	}

	/**
	 * When user logs in, check if refresh token is present in cookie
	 * If its present, verify db record and returns new access token
	 * If missing, creates refresh token in db, stores it in cookie and returns new access token
	 * @param req Request
	 * @param res Response
	 * @returns access token or null
	 */

	private async generateToken(req: Request, res: Response): Promise<string | null> {
		if (this.user?._id) {
			const tokenPayload = { userId: this.user._id, userEmail: this.user.email }
			const accessToken = generateToken('access', tokenPayload, '1h')

			// refresh token is presents in cookies
			if (req.cookies.refresh_token) {
				// verify token and give user new access token
				const { verified } = await AuthService.verifyRefreshToken(this.user._id, req.cookies.refresh_token)
				if (!verified) return null
				return accessToken
			} else {
				// no refresh token in cookies
				const refreshToken = generateToken('refresh', tokenPayload, '7d')

				const refreshTokenRecord = await AuthService.createRefreshToken(this.user._id, refreshToken)

				if (refreshTokenRecord) {
					// set refresh token in cookies
					// if it expires, user should have to login/authenticate again
					res.cookie('refresh_token', refreshTokenRecord.value, cookieOptions)
					// return new access token
					return accessToken
				}
			}
		}

		return null
	}

	/**
	 * Refresh user ressources access with new access token and new refresh token.
	 * @param req Request
	 * @param res Response
	 * @returns void
	 */

	public async refreshToken(req: Request, res: Response) {
		console.log('AuthController - refreshToken called, req.user:', req.user)

		if (!req.cookies.refresh_token) {
			return this.unauthorized(res, 'refresh token is missing in cookies')
		}

		const userRecord = await UserService.getById(req.user.userId)

		// verify token in db with user id from jwt verify payload
		const { record, verified } = await AuthService.verifyRefreshToken(req.user.userId, req.cookies.refresh_token)

		if (!record) {
			return this.unauthorized(res, 'refresh token does not exists')
		}

		if (!verified) {
			return this.unauthorized(res, 'invalid token')
		}

		if (userRecord) {
			const tokenPayload = { userId: userRecord._id.toString(), userEmail: userRecord.email }
			const accessToken = generateToken('access', tokenPayload, '1h')

			const rotated = await this.rotateToken(res, tokenPayload)

			if (rotated) {
				this.ok(res, {
					success: true,
					user: userRecord,
					accessToken
				})
			}
		}
	}

	/**
	 * Refresh token rotation -
	 * Update db refresh token record and replace existing cookie with new token value.
	 * @param res Response
	 * @param payload TokenPayload
	 * @returns boolean
	 */

	private async rotateToken(res: Response, payload: TokenPayload): Promise<boolean> {
		const refreshToken = generateToken('refresh', payload, '7d')

		const updatedRefreshTokenRecord = await AuthService.updateRefreshToken(payload.userId, refreshToken)

		if (updatedRefreshTokenRecord) {
			res.clearCookie('refresh_token')
			res.cookie('refresh_token', updatedRefreshTokenRecord.value, cookieOptions)
			return true
		} else {
			return false
		}
	}

	/**
	 * Logout user by deleting db refresh token record and cookie.
	 * @param req Request
	 * @param res Response
	 * @returns void
	 */

	public async logout(req: Request, res: Response) {
		const deleted = await AuthService.deleteRefreshToken(req.user.userId)

		if (!deleted) {
			return this.serverError(res, 'An error occured while logout your account.')
		}

		res.clearCookie('refresh_token')

		this.ok(res, { success: true, accessToken: null })
	}
}
