/*
 * Next Subdomain Router Utility Functions
 *
 * Created by zacaw99 Copyright (c) 2026
 */

export function stripPort(hostname: string): string {
	return hostname.replace(/:\d+$/, "");
}

export function normalisePrefix(prefix: string): string {
	let value = prefix.trim();

	if (!value.startsWith("/")) {
		value = "/" + value;
	}

	if (value.length > 1 && value.endsWith("/")) {
		value = value.slice(0, -1);
	}

	return value;
}

export function isDirectInternalRoute(
	path: string,
	internalHiddenRoutePrefix: string,
): boolean {
	const normalisedPrefix = normalisePrefix(internalHiddenRoutePrefix);

	return path === normalisedPrefix || path.startsWith(normalisedPrefix + "/");
}

export function splitHostname(hostname: string): string[] {
	return stripPort(hostname)
		.split(".")
		.map((part) => part.trim().toLowerCase())
		.filter((part) => part.length > 0);
}

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

	if (strippedHost.endsWith(`.${strippedRootDomain}`)) {
		const subdomain = strippedHost.slice(0, -(strippedRootDomain.length + 1));

		return subdomain || null;
	}

	if (strippedHost.endsWith(`.${strippedDevHost}`)) {
		const subdomain = strippedHost.slice(0, -(strippedDevHost.length + 1));

		return subdomain || null;
	}

	return null;
}

export function joinInternalRoute(
	internalHiddenRoutePrefix: string,
	segment: string,
	pathname: string,
	search: string,
): string {
	const normalisedPrefix = normalisePrefix(internalHiddenRoutePrefix);
	const normalisedSegment = segment.startsWith("/") ? segment : `/${segment}`;
	const path = pathname === "/" ? "" : pathname;

	return `${normalisedPrefix}${normalisedSegment}${path}${search}`;
}
