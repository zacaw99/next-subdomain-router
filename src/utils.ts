/*
 * Next Subdomain Router Utility Functions
 *
 * Created by zacaw99 Copyright (c) 2026
 */

/*
    Strips the port from a hostname if it exists.
    For example, "localhost:3000" becomes "localhost".
*/
export function stripPort(hostname: string): string {
	return hostname.replace(/:\d+$/, "");
}

/*
    Normalise Prefix
    Ensures that a prefix starts with a "/" and does not end with a "/".
    For example, "sites" becomes "/sites", and "/sites/" becomes "/sites".
*/
export function normalisePrefix(prefix: string): string {
	if (!prefix.startsWith("/")) {
		prefix = "/" + prefix;
	}
	if (prefix.endsWith("/")) {
		prefix = prefix.slice(0, -1);
	}
	return prefix;
}

/*
    Checks if a given path is a direct internal route based on the internal hidden route prefix.
    A direct internal route is defined as either the exact prefix or any path that starts with the prefix followed by a "/".
    For example, if the prefix is "/_sites", then "/_sites" and "/_sites/page" would be considered direct internal routes, while "/other" would not.
*/
export function isDirectInternalRoute(
	path: string,
	internalHiddenRoutePrefix: string,
): boolean {
	const normalisedPrefix = normalisePrefix(internalHiddenRoutePrefix);
	return path === normalisedPrefix || path.startsWith(normalisedPrefix + "/");
}

/*
    Splits a hostname into its constituent parts, ignoring any port information.
    For example, "sub.example.com:3000" becomes ["sub", "example", "com"].
*/
export function splitHostname(hostname: string): string[] {
	return stripPort(hostname)
		.split(".")
		.map((part) => part.trim().toLowerCase())
		.filter((part) => part.length > 0);
}

/*
    Checks if a given host is an apex host, which means it matches the root domain or is one of the development hosts.
    For example, if the root domain is "example.com" and the development hosts are ["localhost"], then "example.com" and "localhost" would be considered apex hosts, while "sub.example.com" would not.
*/
export function isApexHost(
	host: string,
	rootDomain: string,
	devHosts: string[],
): boolean {
	const strippedHost = stripPort(host).toLowerCase();
	const strippedRootDomain = stripPort(rootDomain).toLowerCase();
	const isDevHost = devHosts.some(
		(devHost) => stripPort(devHost).toLowerCase() === strippedHost,
	);
	return strippedHost === strippedRootDomain || isDevHost;
}

/*
    Extracts the subdomain from a given host based on the root domain.
    For example, if the host is "sub.example.com" and the root domain is "example.com", then the extracted subdomain would be "sub". If the host is "example.com", then there is no subdomain and the function returns null.
*/
export function extractSubdomain(
	host: string,
	rootDomain: string,
	devHost: string,
): string | null {
	const strippedHost = stripPort(host).toLowerCase();
	const strippedRootDomain = stripPort(rootDomain).toLowerCase();
	const strippedDevHost = stripPort(devHost).toLowerCase();
	if (strippedHost === strippedRootDomain || strippedHost === strippedDevHost) {
		return null;
	}
	const hostParts = splitHostname(strippedHost);
	const rootDomainParts = splitHostname(strippedRootDomain);
	if (hostParts.length <= rootDomainParts.length) {
		return null;
	}
	const subdomainParts = hostParts.slice(
		0,
		hostParts.length - rootDomainParts.length,
	);
	return subdomainParts.join(".");
}

/*
    Joins the internal hidden route prefix with a given segment, pathname, and search string to create a full internal route.
    For example, if the internal hidden route prefix is "/_sites", the segment is "sub", the pathname is "/page", and the search is "?query=1", then the resulting internal route would be "/_sites/sub/page?query=1".
*/
export function joinInternalRoute(
	internalHiddenRoutePrefix: string,
	segment: string,
	pathname: string,
	search: string,
): string {
	const normalisedPrefix = normalisePrefix(internalHiddenRoutePrefix);
	const normalisedSegment = segment.startsWith("/") ? segment : "/" + segment;
	const normalisedPathname = pathname.startsWith("/")
		? pathname
		: "/" + pathname;
	return `${normalisedPrefix}${normalisedSegment}${normalisedPathname}${search}`;
}
