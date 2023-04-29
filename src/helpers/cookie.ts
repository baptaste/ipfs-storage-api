import { CookieOptions } from 'express'

export const cookieOptions: CookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production' ? true : false,
	sameSite: 'strict',
	maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
}
