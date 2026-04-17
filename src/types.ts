/*
 * Next Subdomain Router Type Declarations
 *
 * Created by zacaw99 Copyright (c) 2026
 */

import { NextRequest, NextResponse } from "next/server";

export type StaticSubdomainMap = Record<string, string>;
export type NotFoundStrategy = "response" | "rewrite";

export interface CreateSubdomainRouterOptions {
	/*
	 * Root Domain
	 * The root domain for which the subdomain router will be used.
	 */
	rootDomain: string;

	/*
	 * Internal Hidden Route Prefix
	 * The prefix used for internal hidden routes. This is used to avoid conflicts with user-defined routes.
	 * Default: "_sites"
	 */
	internalHiddenRoutePrefix?: string;

	/*
	 * Deny Direct Access to Subdomain Routes
	 * If true, direct access to subdomain routes will be denied, and users will be shown a 404 page.
	 * Default: false
	 */
	denyDirectAccess?: boolean;

	/*
        Subdomains
        A mapping of static subdomains to their corresponding internal routes. This allows you to define specific subdomains that route to specific pages.
        Default: {}
        Example: { "blog": "blog", "shop": "shop" }
    */
	subdomains?: StaticSubdomainMap;

	/*
	 * Reserved Subdomains
	 * An array of subdomains that are reserved and cannot be used by dynamic subdomain routing.
	 * Default: []
	 * Example: ["www", "api", "admin"]
	 */
	reservedSubdomains?: string[];

	/*
	 * Enable Dynamic Subdomain Routing
	 * If true, dynamic subdomain routing will be enabled, allowing any subdomain to be routed to a corresponding page.
	 * Default: true
	 */
	enableDynamicSubdomainRouting?: boolean;

	/*
	 * Allowed Dynamic Subdomains
	 * An array of allowed dynamic subdomains. If specified, only these subdomains will be allowed for dynamic routing.
	 * Default: []
	 * Example: ["user", "account", "profile"]
	 */
	allowedDynamicSubdomains?: string[];

	/*
	 * Development Hostname
	 * The hostname to use for development. This is used to ensure that the subdomain routing works correctly in development environments.
	 * Default: "localhost"
	 */
	developmentHostname?: string;

	/*
	 * Rewrite Root Path
	 * If true, the root path ("/") will be rewritten to the internal hidden route prefix. This is useful for handling requests to the root domain.
	 * Default: false
	 */
	rewriteRootPath?: boolean;

	/*
	 * Root Subdomain
	 * If rewriteRootPath is true, the subdomain to use for the root path.
	 */
	rootSubdomain?: string;

	/*
	 * Not Found Strategy
	 * Controls how rejected requests are handled.
	 * - "response": return a raw 404 response
	 * - "rewrite": rewrite to a provided route
	 * Default: "response"
	 */
	notFoundStrategy?: NotFoundStrategy;

	/*
	 * Not Found Rewrite Path
	 * Used only when notFoundStrategy is "rewrite".
	 * Example: "/404" or "/not-found"
	 * Default: "/404"
	 */
	notFoundRewritePath?: string;

	/*
	 * Before Proxy
	 * Runs before subdomain routing logic.
	 * Can optionally return a NextResponse to short-circuit the proxy.
	 */
	beforeProxy?: (
		request: NextRequest,
	) => void | NextResponse | Promise<void | NextResponse>;

	/*
	 * After Proxy
	 * Runs after subdomain routing logic has produced a response.
	 * Useful for modifying cookies, headers, or integrating with auth/session handlers.
	 */
	afterProxy?: (
		request: NextRequest,
		response: NextResponse,
	) => NextResponse | Promise<NextResponse>;
}
