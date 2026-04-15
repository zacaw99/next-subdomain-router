# next-subdomain-router

Subdomain-based routing for Next.js 16 using `proxy.ts`.

`next-subdomain-router` allows you to map subdomains (e.g. `app.example.com`) to internal App Router paths (e.g. `/sites/app`) with support for:

- Static subdomain routing
- Dynamic subdomain routing
- Local development (`*.localhost`)
- Internal route protection
- Configurable 404 handling (response or rewrite)

## 📝 Changelog

### v1.0.3
- Added `allowedDynamicSubdomains` option to whitelist specific subdomains for dynamic routing

## ✨ Features

- 🔁 Rewrite subdomains to App Router paths
- ⚙️ Static and dynamic routing support
- 🧪 Works in development (`*.localhost`)
- 🔒 Optional blocking of direct internal routes
- 🧩 Fully configurable behaviour
- 🚫 No middleware hacks - built for `proxy.ts`

## 📦 Installation

```bash
npm install next-subdomain-router
```

---

### 1. Create your route structure

Inside your Next.js `app/` directory, create a folder to hold subdomain routes.

> ⚠️ Do NOT use underscore-prefixed folders (e.g. `_sites`). Next.js treats them as private and they are not routable.

```txt
app/
  sites/
    app/
      page.tsx
    test/
      page.tsx
    [subdomain]/
      page.tsx   # (optional for dynamic routing)
```

---

At the root of your project:

```ts
import { createSubdomainRouter } from "next-subdomain-router";

export const proxy = createSubdomainRouter({
	rootDomain: "example.com",
	internalHiddenRoutePrefix: "sites",

	subdomains: {
		app: "app",
		test: "test",
	},

	enableDynamicSubdomainRouting: true,

	denyDirectAccess: true,
	developmentHostname: "localhost:3000",

	notFoundStrategy: "response", // or "rewrite"
	notFoundRewritePath: "/404", // only used if strategy = "rewrite"
});

export const config = {
	matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)"],
};
```

### 3. Configure allowed dynamic subdomains (optional)

When using `enableDynamicSubdomainRouting: true` with a `[subdomain]` dynamic route folder, you can restrict which subdomain values are accepted using `allowedDynamicSubdomains`. This acts as a whitelist for the `params.subdomain` value:

```ts
export const proxy = createSubdomainRouter({
	// ... other config
	enableDynamicSubdomainRouting: true,
	allowedDynamicSubdomains: ["user", "account", "profile"], // Only these values are allowed for [subdomain]
});
```

Your route structure:
```txt
app/
  sites/
    [subdomain]/
      page.tsx  # Receives params.subdomain
```

| Request             | Result                                 |
| ------------------- | -------------------------------------- |
| `user.example.com`  | ✅ Routes to `/sites/[subdomain]` with `params.subdomain = "user"`      |
| `profile.example.com` | ✅ Routes to `/sites/[subdomain]` with `params.subdomain = "profile"`   |
| `admin.example.com` | ❌ 404 (not in allowed list)           |

When `allowedDynamicSubdomains` is **not specified**, all subdomains (except reserved ones) are allowed dynamically. This option acts as an allowlist to control which subdomain slugs can be used.

---

Incoming requests are intercepted in `proxy.ts`, and the hostname is analysed:

| Request             | Internal Route                     |
| ------------------- | ---------------------------------- |
| `app.example.com`   | `/sites/app`                       |
| `test.example.com`  | `/sites/test`                      |
| `alpha.example.com` | `/sites/alpha` _(dynamic)_         |
| `example.com`       | `/` _(or rewritten if configured)_ |

The user never sees the internal route - rewrites happen transparently.

---

Works out of the box with `localhost`.

| Request                | Result         |
| ---------------------- | -------------- |
| `app.localhost:3000`   | `/sites/app`   |
| `test.localhost:3000`  | `/sites/test`  |
| `alpha.localhost:3000` | `/sites/alpha` |

---

## ⚙️ Configuration

### `rootDomain` (required)

Your production domain.

```ts
rootDomain: "example.com";
```

### `internalHiddenRoutePrefix`

Internal route prefix used for rewrites. Default: `"sites"`

```ts
internalHiddenRoutePrefix: "sites";
```

### `subdomains`

Static mapping of subdomains to routes.

```ts
subdomains: {
  app: "app",
  blog: "blog",
}
```

### `enableDynamicSubdomainRouting`

Enable fallback dynamic routing. Default: `false`

```ts
enableDynamicSubdomainRouting: true;
```

Requires:

```txt
app/sites/[subdomain]/page.tsx
```

### `allowedDynamicSubdomains`

Whitelist specific subdomains for dynamic routing. When specified, only these subdomains will be allowed. Default: `undefined` (all subdomains allowed)

```ts
allowedDynamicSubdomains: ["user", "account", "profile"];
```

### `reservedSubdomains`

Subdomains that should never be dynamically routed. Default: `["www"]`

```ts
reservedSubdomains: ["www", "api"];
```

### `denyDirectAccess`

Blocks direct access to internal routes. Default: `false`

```ts
denyDirectAccess: true;
```

| URL               | Result   |
| ----------------- | -------- |
| `/sites/app`      | ❌ 404   |
| `app.example.com` | ✅ works |

### `developmentHostname`

Used for local subdomain detection. Default: `"localhost:3000"`

```ts
developmentHostname: "localhost:3000";
```

### `rewriteRootPath` & `rootSubdomain`

Rewrite the root domain to a subdomain route. Default: `false`

```ts
rewriteRootPath: true,
rootSubdomain: "app"
```

| Request       | Result       |
| ------------- | ------------ |
| `example.com` | `/sites/app` |

### `notFoundStrategy` & `notFoundRewritePath`

Controls behaviour for unknown subdomains. Default strategy: `"response"`

#### `"response"` (default)

```ts
notFoundStrategy: "response";
```

Returns a raw 404 response.

#### `"rewrite"`

```ts
notFoundStrategy: "rewrite",
notFoundRewritePath: "/404"
```

Rewrites to a route inside your app.

## 🧪 Example

```ts
createSubdomainRouter({
	rootDomain: "example.com",
	internalHiddenRoutePrefix: "sites",

	subdomains: {
		app: "app",
	},

	enableDynamicSubdomainRouting: true,
});
```

| URL               | Route        |
| ----------------- | ------------ |
| `app.example.com` | `/sites/app` |
| `foo.example.com` | `/sites/foo` |

---

## ▲ Vercel Setup (Wildcard Subdomains)

To use `next-subdomain-router` on Vercel with real subdomains (e.g. `app.domain.com`, `test.domain.com`), you must configure **wildcard domains correctly**.

This is required for subdomain routing to work in production.

---

## ⚠️ Important

Wildcard subdomains **will NOT work** on:

```txt
*.vercel.app ❌
```

You must use a **custom domain**.

---

## 1. Add Domains in Vercel

Go to your project → **Settings → Domains**

Add:

```txt
yourdomain.com
*.yourdomain.com
```

After adding, Vercel will show a configuration status.

---

## 2. Configure DNS (Recommended: Nameservers)

From experience, the most reliable method is to use **Vercel DNS via nameservers**.

### Update your domain nameservers to:

```txt
ns1.vercel-dns.com
ns2.vercel-dns.com
```

This allows Vercel to:

- automatically manage wildcard routing
- issue SSL certificates for `*.yourdomain.com`
- avoid common DNS misconfiguration issues

---

## 3. Wait for SSL Provisioning

After configuration, Vercel will show:

```txt
Generating SSL Certificate...
```

Wait until this changes to:

```txt
Valid Configuration ✅
```

---

## 4. Verify Setup

Once ready, test:

```txt
app.yourdomain.com
test.yourdomain.com
alpha.yourdomain.com
```

All subdomains should resolve to your Vercel project.

---

## 5. Update Your Router Config

Make sure your router uses your real domain:

```ts
createSubdomainRouter({
	rootDomain: "yourdomain.com",
	internalHiddenRoutePrefix: "sites",
	enableDynamicSubdomainRouting: true,
});
```

---

## 6. Common Issues

### ❌ Subdomains return Vercel 404

- Domain not added in Vercel
- SSL not finished generating

### ❌ Subdomains do not resolve

- Nameservers not updated
- DNS propagation not complete

### ❌ Assets (CSS/JS/images) fail to load

- Ensure your proxy excludes:
  - `/_next/`
  - files with extensions (e.g. `.js`, `.css`, `.svg`)

---

## 🧠 Notes

- `proxy.ts` runs before routing - ensure assets are not rewritten
- Wildcard domains are essential for **dynamic subdomain routing**
- Using Vercel nameservers avoids most DNS-related issues

---

## ✅ Summary

| Step                                 | Required |
| ------------------------------------ | -------- |
| Add `*.domain` in Vercel             | ✅       |
| Configure DNS / nameservers          | ✅       |
| Wait for SSL provisioning            | ✅       |
| Use custom domain (not `vercel.app`) | ✅       |

---

Once configured, `next-subdomain-router` will work seamlessly with Vercel deployments.

---

## ⚠️ Important Notes

### ❌ Do NOT use `_sites`

```txt
app/_sites/app/page.tsx ❌
```

This will NOT work - Next.js ignores underscore-prefixed folders.

Use:

```txt
app/sites/app/page.tsx ✅
```

---

### Proxy runs before routing

This library works via `proxy.ts`, which runs before the App Router resolves the request.

- It **rewrites requests**
- It **does not render UI**
- It **does not use `notFound()`**

---

## 📄 License

MIT

---

## 👤 Author

Created by **zacaw99**
