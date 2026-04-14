import { NextRequest, NextResponse } from "next/server";
import type { CreateSubdomainRouterOptions } from "./types";
import {
	extractSubdomain,
	isDirectInternalRoute,
	normalisePrefix,
	joinInternalRoute,
	stripPort,
} from "./utils";

export type { CreateSubdomainRouterOptions } from "./types";

export function createSubdomainRouter(options: CreateSubdomainRouterOptions) {
	const {
		rootDomain,
		denyDirectAccess = false,
		subdomains = {},
		reservedSubdomains = ["www"],
		enableDynamicSubdomainRouting = false,
		developmentHostname = "localhost:3000",
		rewriteRootPath = false,
		rootSubdomain,
	} = options;

	const internalHiddenRoutePrefix = normalisePrefix(
		options.internalHiddenRoutePrefix || "_sites",
	);

	const reserved = new Set(reservedSubdomains.map((sub) => sub.toLowerCase()));
	const staticMap = new Map(
		Object.entries(subdomains).map(([sub, route]) => [
			sub.toLowerCase(),
			route,
		]),
	);

	return function proxy(request: NextRequest) {
		const hostHeader = request.headers.get("host");
		if (!hostHeader) {
			return NextResponse.next();
		}

		const host = stripPort(hostHeader).toLowerCase();
		const { pathname, search } = request.nextUrl;

		if (
			denyDirectAccess &&
			isDirectInternalRoute(pathname, internalHiddenRoutePrefix)
		) {
			return NextResponse.rewrite(new URL("/404", request.url));
		}

		const subdomain = extractSubdomain(host, rootDomain, developmentHostname);

		if (subdomain === null) {
			if (rewriteRootPath && rootDomain) {
				const internalRoute = joinInternalRoute(
					internalHiddenRoutePrefix,
					rootSubdomain || "",
					pathname,
					search,
				);
				return NextResponse.rewrite(new URL(internalRoute, request.url));
			}
			return NextResponse.next();
		}

		const staticRoute = staticMap.get(subdomain);
		if (staticRoute) {
			const internalRoute = joinInternalRoute(
				internalHiddenRoutePrefix,
				staticRoute,
				pathname,
				search,
			);
			return NextResponse.rewrite(new URL(internalRoute, request.url));
		}

		if (!reserved.has(subdomain) && enableDynamicSubdomainRouting) {
			const internalRoute = joinInternalRoute(
				internalHiddenRoutePrefix,
				subdomain,
				pathname,
				search,
			);
			return NextResponse.rewrite(new URL(internalRoute, request.url));
		}

		return NextResponse.next();
	};
}
