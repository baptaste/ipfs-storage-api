type ProjectionQuery = {
	field: string
	include: boolean
}

export function queryProjection(query: ProjectionQuery[]): string {
	let projection: string = ''

	for (let i = 0; i < query.length; i++) {
		projection += (query[i].include ? '+' : '-') + query[i].field + ' '
	}

	return projection
}
