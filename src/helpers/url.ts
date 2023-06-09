export function extractDomainFromURL(url: string): string | null {
	const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im;
	const matches = url.match(domainRegex);

	if (matches && matches[1]) {
		const domain = matches[1];
		const domainParts = domain.split(".");
		// Remove "www" if present
		if (domainParts[0] === "www") {
			domainParts.shift();
		}
		// Remove domain extension if present
		if (domainParts.length > 1) {
			domainParts.pop();
		}
		return domainParts.join(".");
	} else {
		console.error("Invalid URL");
		return null;
	}
}
