import { File } from 'web3.storage'

export function toFileArray(data: any): File[] {
	const buffer = Buffer.from(JSON.stringify(data))
	console.log('toFileArray before defining file')
	const files = [new File([buffer], '')]
	return files
	// const file = new File([buffer], `data-${new Date().getTime()}.json`, { type: 'text/plain' })
	// console.log('toFileArray, file:', file, '[file]:', [file])

	// return [file]
}
