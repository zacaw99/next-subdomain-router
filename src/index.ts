import { NextRequest, NextResponse } from "next/server";
import type { CreateSubdomainRouterOptions, NotFoundStrategy } from "./types";
import {
	extractSubdomain,
	isDirectInternalRoute,
	normalisePrefix,
	joinInternalRoute,
} from "./utils";

export type { CreateSubdomainRouterOptions, NotFoundStrategy } from "./types";

function handleNotFound(
	request: NextRequest,
	strategy: NotFoundStrategy,
	rewritePath: string,
) {
	if (strategy === "rewrite") {
		return NextResponse.rewrite(new URL(rewritePath, request.url));
	}

	return new NextResponse("Not Found", { status: 404 });
}

export function createSubdomainRouter(options: CreateSubdomainRouterOptions) {
	const {
		rootDomain,
		denyDirectAccess = false,
		subdomains = {},
		reservedSubdomains = ["www"],
		enableDynamicSubdomainRouting = false,
		allowedDynamicSubdomains,
		developmentHostname = "localhost:3000",
		rewriteRootPath = false,
		rootSubdomain,
		notFoundStrategy = "response",
		notFoundRewritePath = "/404",
		beforeProxy,
		afterProxy,
	} = options;

	const internalHiddenRoutePrefix = normalisePrefix(
		options.internalHiddenRoutePrefix || "sites",
	);

	const reserved = new Set(reservedSubdomains.map((sub) => sub.toLowerCase()));
	const staticMap = new Map(
		Object.entries(subdomains).map(([sub, route]) => [
			sub.toLowerCase(),
			route,
		]),
	);

	return async function proxy(request: NextRequest) {
		const hostHeader = request.headers.get("host");

		if (!hostHeader) {
			let response = NextResponse.next();

			if (afterProxy) {
				response = await afterProxy(request, response);
			}

			return response;
		}

		if (beforeProxy) {
			const beforeResult = await beforeProxy(request);

			if (beforeResult instanceof NextResponse) {
				let response = beforeResult;

				if (afterProxy) {
					response = await afterProxy(request, response);
				}

				return response;
			}
		}

		const host = hostHeader.toLowerCase();
		const { pathname, search } = request.nextUrl;

		const isAssetRequest =
			pathname.startsWith("/_next/") ||
			pathname === "/favicon.ico" ||
			pathname === "/robots.txt" ||
			pathname === "/sitemap.xml" ||
			/\.[a-zA-Z0-9]+$/.test(pathname);

		if (isAssetRequest) {
			return NextResponse.next();
		}

		if (
			denyDirectAccess &&
			isDirectInternalRoute(pathname, internalHiddenRoutePrefix)
		) {
			return handleNotFound(request, notFoundStrategy, notFoundRewritePath);
		}

		const subdomain = extractSubdomain(host, rootDomain, developmentHostname);

		if (subdomain === null) {
			if (rewriteRootPath && rootSubdomain) {
				const internalRoute = joinInternalRoute(
					internalHiddenRoutePrefix,
					rootSubdomain,
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

		const isAllowedDynamicSubdomain =
			enableDynamicSubdomainRouting &&
			!reserved.has(subdomain) &&
			(allowedDynamicSubdomains === undefined ||
				allowedDynamicSubdomains.includes(subdomain));

		if (isAllowedDynamicSubdomain) {
			const internalRoute = joinInternalRoute(
				internalHiddenRoutePrefix,
				subdomain,
				pathname,
				search,
			);

			return NextResponse.rewrite(new URL(internalRoute, request.url));
		}

		let response = handleNotFound(
			request,
			notFoundStrategy,
			notFoundRewritePath,
		);

		if (afterProxy) {
			response = await afterProxy(request, response);
		}

		return response;
	};
}
