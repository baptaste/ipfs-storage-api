import { JsonWebTokenError } from 'jsonwebtoken'
import { TokenPayload, verifyToken } from '../../helpers/token'
import Token from '../../models/Token'

export type RefreshToken = {
	_id: string
	user_id: string
	value: string
	created_at: string
}

export default class AuthService {
	static createRefreshToken(userId: string, token: string): Promise<RefreshToken> {
		return new Promise((resolve, reject) => {
			console.log('AuthService - create refresh token with userId:', userId, ' token:', token)
			Token.create({ user_id: userId, value: token })
				.then((token: RefreshToken) => {
					console.log('AuthService - create refresh token success, token:', token)
					resolve(token)
				})
				.catch((err) => {
					console.log('AuthService - create refresh token error:', err)
					reject(err)
				})
		})
	}

	static verifyRefreshToken(
		userId: string,
		token: string
	): Promise<{ record: boolean; verified: boolean }> {
		const secret = process.env.REFRESH_TOKEN_SECRET as string
		console.log('AuthService - verify refresh token with userId:', userId, ' token:', token)

		return new Promise((resolve, reject) => {
			Token.findOne({ user_id: userId, value: token })
				.then((tokenRecord: RefreshToken) => {
					console.log('AuthService - verify refresh token tokenRecord:', tokenRecord)

					console.log('AuthService - verify refresh token failed, not found')
					if (!tokenRecord) {
						console.log('AuthService - verify refresh token failed, not found')
						resolve({ record: false, verified: false })
					}

					const result = verifyToken(tokenRecord.value, secret)
					console.log(
						'AuthService - verify refresh token result:',
						result,
						'token:',
						tokenRecord
					)
					if (result instanceof JsonWebTokenError) {
						console.log('on passe dans result instanceof JsonWebTokenError')

						resolve({ record: true, verified: false })
					} else if (result !== undefined) {
						console.log('AuthService - on passe dans result result !== undefined')

						const { userId } = result as TokenPayload
						console.log('AuthService - token payload userId:', userId)

						if (userId === tokenRecord.user_id.toString()) {
							console.log('AuthService - verify refresh token success')
							resolve({ record: true, verified: true })
						}
					}
				})
				.catch((err) => {
					console.log('AuthService - verify refresh token error:', err)
					reject(err)
				})
		})
	}

	static deleteRefreshToken(userId: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			console.log('AuthService - delete refresh token with userId:', userId)
			Token.deleteOne({ user_id: userId })
				.then((res) => {
					console.log('AuthService - delete refresh token success')
					resolve(res.deletedCount === 1)
				})
				.catch((err) => {
					console.log('AuthService - delete refresh token error:', err)
					reject(err)
				})
		})
	}

	static getRefreshToken(userId: string): Promise<RefreshToken | null> {
		return new Promise((resolve, reject) => {
			console.log('AuthService - get refresh token with userId:', userId)
			Token.findOne({ user_id: userId })
				.then((token: RefreshToken) => {
					if (token) {
						console.log('AuthService - get refresh token success, token:', token)
						resolve(token)
					} else {
						console.log('AuthService - get refresh token failed')
						resolve(null)
					}
				})
				.catch((err) => {
					console.log('AuthService - get refresh token error:', err)
					reject(err)
				})
		})
	}

	static updateRefreshToken(userId: string, token: string): Promise<RefreshToken | null> {
		return new Promise((resolve, reject) => {
			Token.findOneAndUpdate({ user_id: userId }, { value: token }, { new: true })
				.then((token: RefreshToken) => {
					if (token) {
						console.log('AuthService - updateRefreshToken success, token:', token)
						resolve(token)
					} else {
						console.log('AuthService - updateRefreshToken failed, token:', token)
						resolve(null)
					}
				})
				.catch((err) => {
					console.log('AuthService - updateRefreshToken error:', err)
					reject(err)
				})
		})
	}
}
