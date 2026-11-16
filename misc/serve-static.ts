/* Minimal static file server for local design review only.

   Usage: bun misc/serve-static.ts <directory> <port>
   Serves index.html for directory URLs so pretty Hugo URLs work. */

const root = process.argv[2] ?? ".";
const port = Number(process.argv[3] ?? 4321);

Bun.serve({
    port,
    async fetch(request: Request)
    {
        const url = new URL(request.url);
        let path = decodeURIComponent(url.pathname);
        if (path.endsWith("/")) { path += "index.html"; }

        const file = Bun.file(`${root}${path}`);
        if (await file.exists()) { return new Response(file); }

        const fallback = Bun.file(`${root}${path}/index.html`);
        if (await fallback.exists()) { return new Response(fallback); }

        return new Response("Not found", { status: 404 });
    },
});

console.log(`Serving ${root} on http://localhost:${port}`);
