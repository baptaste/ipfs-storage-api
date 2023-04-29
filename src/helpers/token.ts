import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
// import { IRefreshToken } from '../types'

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env

export type TokenType = 'access' | 'refresh'

export type TokenPayload = {
	userId: string
	userEmail: string
	iat?: number
	exp?: number
}

export type VerifyTokenResult = VerifyErrors | JwtPayload | TokenPayload | string | undefined

export function generateToken(type: TokenType, payload: any, expiresIn?: string | number): string {
	const secret = (type === 'refresh' ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET) as string
	return jwt.sign(payload, secret, { expiresIn })
}

export function verifyToken(token: string, secret: string): VerifyTokenResult {
	let result: VerifyTokenResult = undefined

	jwt.verify(token, secret, (err, decoded) => {
		err ? (result = err) : (result = decoded)
	})

	return result
}
