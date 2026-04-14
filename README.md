# next-subdomain-router

Subdomain-based routing for Next.js 16 using `proxy.ts`.

`next-subdomain-router` allows you to map subdomains (e.g. `app.example.com`) to internal App Router paths (e.g. `/sites/app`) with support for:

- Static subdomain routing
- Dynamic subdomain routing
- Local development (`*.localhost`)
- Internal route protection
- Configurable 404 handling (response or rewrite)

---

## ✨ Features

- 🔁 Rewrite subdomains to App Router paths
- ⚙️ Static and dynamic routing support
- 🧪 Works in development (`*.localhost`)
- 🔒 Optional blocking of direct internal routes
- 🧩 Fully configurable behaviour
- 🚫 No middleware hacks — built for `proxy.ts`

---

## 📦 Installation

```bash
npm install next-subdomain-router
```

---

## 🚀 Usage

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

### 2. Create `proxy.ts`

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

---

## 🧠 How it works

Incoming requests are intercepted in `proxy.ts`, and the hostname is analysed:

| Request             | Internal Route                     |
| ------------------- | ---------------------------------- |
| `app.example.com`   | `/sites/app`                       |
| `test.example.com`  | `/sites/test`                      |
| `alpha.example.com` | `/sites/alpha` _(dynamic)_         |
| `example.com`       | `/` _(or rewritten if configured)_ |

The user never sees the internal route — rewrites happen transparently.

---

## 🧪 Development

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

---

### `internalHiddenRoutePrefix`

Internal route prefix used for rewrites.

```ts
internalHiddenRoutePrefix: "sites";
```

---

### `subdomains`

Static mapping of subdomains to routes.

```ts
subdomains: {
  app: "app",
  blog: "blog",
}
```

---

### `enableDynamicSubdomainRouting`

Enable fallback dynamic routing.

```ts
enableDynamicSubdomainRouting: true;
```

Requires:

```txt
app/sites/[subdomain]/page.tsx
```

---

### `reservedSubdomains`

Subdomains that should never be dynamically routed.

```ts
reservedSubdomains: ["www", "api"];
```

---

### `denyDirectAccess`

Blocks direct access to internal routes.

```ts
denyDirectAccess: true;
```

| URL               | Result   |
| ----------------- | -------- |
| `/sites/app`      | ❌ 404   |
| `app.example.com` | ✅ works |

---

### `developmentHostname`

Used for local subdomain detection.

```ts
developmentHostname: "localhost:3000";
```

---

### `rewriteRootPath`

Rewrite the root domain to a subdomain route.

```ts
rewriteRootPath: true,
rootSubdomain: "app"
```

| Request       | Result       |
| ------------- | ------------ |
| `example.com` | `/sites/app` |

---

### `notFoundStrategy`

Controls behaviour for unknown subdomains.

#### `"response"` (default)

```ts
notFoundStrategy: "response";
```

Returns a raw 404 response.

---

#### `"rewrite"`

```ts
notFoundStrategy: "rewrite",
notFoundRewritePath: "/404"
```

Rewrites to a route inside your app.

---

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

## ⚠️ Important Notes

### ❌ Do NOT use `_sites`

```txt
app/_sites/app/page.tsx ❌
```

This will NOT work — Next.js ignores underscore-prefixed folders.

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
