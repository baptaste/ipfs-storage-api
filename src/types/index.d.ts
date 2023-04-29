import { CookieOptions } from 'express'

export {}

declare global {
	namespace Express {
		interface Request {
			body: any
			params: any
			query: any
			user: any
			cookies: any
		}
		interface Response {
			status: (code: number) => void | any
			json: (data: any) => void
			cookie: (key: string, value: string, options: CookieOptions) => void
		}
	}
}
