import crypto from 'crypto'
import CryptoJS from 'crypto-js'

// generate a CSPRNG (cryptographically secure pseudo-random number generator)
export function generateCSPRNG(size: number): string {
	return crypto.randomBytes(size).toString('hex')
}

export function encryptData(plaintext: string, secretKey: string): string {
	return CryptoJS.AES.encrypt(plaintext, secretKey).toString()
}

export function decryptData(encrypted: string, secretKey: string): string {
	const bytes = CryptoJS.AES.decrypt(encrypted, secretKey)
	return bytes.toString(CryptoJS.enc.Utf8)
}
