import { existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";

const MIME: Record<string,string> = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".eot": "application/vnd.ms-fontobject",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",
    ".wav": "audio/wav",
    ".pdf": "application/pdf",
    ".xml": "application/xml",
    ".txt": "text/plain; charset=utf-8",
};

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

export interface ServerHandle { url: string; port: number; stop: () => void; }

export const startServer = (siteDir:string, port:number) : ServerHandle =>
{
    const root = resolve(siteDir);

    const server = Bun.serve({
        hostname: "127.0.0.1",
        port,
        async fetch(req)
        {
            const url = new URL(req.url);
            let pathname = url.pathname;
            try { pathname = decodeURIComponent(pathname); } catch(e) { return notFound(); }

            // "/x/y/" -> x/y/index.html ; everything else is a plain file
            if(pathname.endsWith("/")) { pathname += "index.html"; }

            const target = resolve(join(root, normalize(pathname)));
            if(target !== root && !target.startsWith(root + sep)) { return notFound(); }
            if(!existsSync(target)) { return notFound(); }

            const stat = statSync(target);
            if(!stat.isFile()) { return notFound(); }

            const body = Bun.file(target);
            const type = MIME[extname(target).toLowerCase()] ?? "application/octet-stream";
            return new Response(body, {
                headers: { "Content-Type": type, "Cache-Control": "no-store" },
            });
        },
    });

    return {
        url: `http://127.0.0.1:${server.port}`,
        port: server.port,
        stop: () => server.stop(true),
    };
}
