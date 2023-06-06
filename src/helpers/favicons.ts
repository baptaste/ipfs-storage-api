export async function getFaviconURL(url: string) {
	const requestUrl = `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
	try {
		const res = await fetch(requestUrl, { method: 'GET' });
		console.log('Favicon res status with url', url, res.status);
		if (res.status === 200) return requestUrl;
		// if (res.status === 400) return undefined;
	} catch (err) {
		console.error('Fetching favicon err', err);
		throw err;
	}
}
