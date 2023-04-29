const options: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric',
	hour12: false
}

export const formatDate = (date: Date, locale?: string): string => {
	return new Intl.DateTimeFormat(locale ?? 'default', options).format(new Date(date))
}

export const sortByDate = (arr: any[]) => {
	// remove whitespace, commas and slashes
	const onlyNumbersRegex = /\s+|[,\/]|[:]/g

	return arr.sort((a: any, b: any) => {
		return (
			b.created_at.replace(onlyNumbersRegex, '') - a.created_at.replace(onlyNumbersRegex, '')
		)
	})
}
