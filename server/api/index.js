// Vercel serverless entry point.
//
// The Build Command (`pnpm build` -> tsc) emits dist/ before Vercel builds the
// functions in this directory, so the compiled Express app is re-exported here
// as the request handler.
//
// This deliberately points at dist/ rather than ../src/app.ts: the source uses
// NodeNext ESM, where imports carry .js extensions that resolve to .ts files on
// disk. Vercel's esbuild-based bundler cannot resolve those, which is why the
// previous `builds: [{ src: "src/app.ts", use: "@vercel/node" }]` config failed.
// The tsc output has real .js files, so bundling it works.
//
// app.listen() is not invoked because src/app.ts only starts a listener when it
// is run as the main module.
export { default } from "../dist/app.js";
