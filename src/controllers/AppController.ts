import { Request, Response } from 'express'

export abstract class AppController {
	isDev: boolean = (process.env.NODE_ENV as string) !== 'production'

	/**
	 * This is the implementation that we will leave to the
	 * subclasses to figure out.
	 * Responsible for running the controller logic
	 */

	protected abstract handler(req: Request, res: Response): Promise<void | any>

	/**
	 * This is what we will call on the route handler.
	 * We also make sure to catch any uncaught errors in the
	 * implementation.
	 */

	public async execute(req: Request, res: Response): Promise<void> {
		try {
			await this.handler(req, res)
		} catch (err) {
			console.error('[AppController]: Uncaught controller error', err)
			this.serverError(res, 'An unexpected error occurred')
		}
	}

	public static jsonResponse(res: Response, code: number, message: string) {
		return res.status(code).json({ success: code === 200 || code === 201, message })
	}

	//////////////////
	// Success res //
	//////////////////

	public ok<T>(res: Response, dto?: T) {
		if (!!dto) {
			res.type('application/json')
			return res.status(200).json(dto)
		} else {
			return res.sendStatus(200)
		}
	}

	public created(res: Response, message?: string) {
		return AppController.jsonResponse(res, 201, message ? message : 'Created successfully')
	}

	//////////////////
	// Client errors //
	//////////////////

	public clientError(res: Response, message?: string) {
		return AppController.jsonResponse(res, 400, message ? message : 'Bad request')
	}

	public unauthorized(res: Response, message?: string) {
		return AppController.jsonResponse(res, 401, message ? message : 'Unauthorized')
	}

	public forbidden(res: Response, message?: string) {
		return AppController.jsonResponse(res, 403, message ? message : 'Forbidden')
	}

	public notFound(res: Response, message?: string) {
		return AppController.jsonResponse(res, 404, message ? message : 'Not found')
	}

	public conflict(res: Response, message?: string) {
		return AppController.jsonResponse(res, 409, message ? message : 'Conflict')
	}

	public tooMany(res: Response, message?: string) {
		return AppController.jsonResponse(res, 429, message ? message : 'Too many requests')
	}

	//////////////////
	// Server errors //
	//////////////////

	public serverError(res: Response, error: Error | string) {
		console.error('[AppController]: Server error:', error)
		return AppController.jsonResponse(res, 500, error.toString())
	}
}
