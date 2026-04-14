# Next Subdomain Router

Subdomain routing for Next.js 16.

Allows routing of requests like:

- 'app.example.com' -> '/\_sites/app'

_without exposting internal paths._

## Install

```bash
npm install next-subdomain-router
```

## Why?

Next.js routing is path-based by default. This package gives you a clean way to add host-based routing using proxy.ts.
