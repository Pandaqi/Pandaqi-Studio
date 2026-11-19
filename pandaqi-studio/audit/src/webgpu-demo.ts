/* Builds the public WebGPU demo into audit-artifacts/webgpu-demo (a static folder ready to host).
 *
 *   cd pandaqi-studio/audit
 *   bun run webgpu-demo
 */

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const auditDir = resolve(import.meta.dir, "..");
const studioDir = resolve(auditDir, "..");
const outDir = join(studioDir, "audit-artifacts", "webgpu-demo");
const libDir = join(studioDir, "assets", "lib", "pq-games");

const aliasPlugin = {
    name: "pq-games-alias",
    setup(build:any)
    {
        build.onResolve({ filter: /^lib\/pq-games($|\/)/ }, (args:any) =>
        {
            const sub = args.path.slice("lib/pq-games".length).replace(/^\//, "");
            if(!sub) { return { path: join(libDir, "index.ts") }; }
            const candidate = join(libDir, sub);
            if(sub.endsWith(".ts")) { return { path: candidate } };
            try
            {
                if(Bun.file(candidate).size > 0) { return { path: candidate } };
            }
            catch(error) { /* not a file: fall through to the directory/module forms */ }
            try
            {
                if(Bun.file(join(candidate, "index.ts")).size > 0) { return { path: join(candidate, "index.ts") } };
            }
            catch(error) { /* not a directory */ }
            return { path: `${candidate}.ts` };
        });
    },
};

const main = async () =>
{
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });

    const result = await Bun.build({
        entrypoints: [join(auditDir, "bench", "demoEntry.ts")],
        outdir: outDir,
        naming: "demo.js",
        target: "browser",
        format: "iife",
        minify: true,
        sourcemap: "none",
        plugins: [aliasPlugin],
    });

    if(!result.success)
    {
        for(const log of result.logs) { console.error(String(log)); }
        process.exit(2);
    }

    writeFileSync(join(outDir, "index.html"), HTML, "utf8");
    console.log(`demo built: ${outDir}`);
}

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>pq-games — WebGPU renderer check</title>
<style>
    :root { color-scheme: dark; --bg:#0b0d10; --panel:#141920; --line:#26303d; --text:#dbe4f0; --dim:#8fa0b5; --ok:#5ad18a; --warn:#f0b45a; --accent:#58a6ff; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--bg); color:var(--text); font:14px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
    main { max-width: 1340px; margin: 0 auto; padding: 20px 20px 60px; }
    h1 { font-size:20px; margin:0 0 4px; letter-spacing:.01em; }
    h2 { font-size:13px; text-transform:uppercase; letter-spacing:.09em; color:var(--dim); margin:0 0 10px; }
    p.lead { color:var(--dim); margin:0 0 18px; max-width:80ch; }
    .bar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:14px; }
    .seg { display:flex; border:1px solid var(--line); border-radius:8px; overflow:hidden; }
    .seg button { background:transparent; color:var(--text); border:0; padding:7px 13px; font:inherit; cursor:pointer; }
    .seg button.active { background:var(--accent); color:#06101c; font-weight:600; }
    .stat { display:flex; gap:18px; flex-wrap:wrap; }
    .stat div { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:8px 14px; min-width:120px; }
    .stat span { display:block; color:var(--dim); font-size:11px; text-transform:uppercase; letter-spacing:.08em; }
    .stat strong { font-size:17px; font-variant-numeric: tabular-nums; }
    #stage-wrap { position:relative; border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#05070a; aspect-ratio: 16 / 9; }
    #stage-wrap canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }
    .grid { display:grid; grid-template-columns: minmax(0,1fr) 360px; gap:18px; align-items:start; }
    @media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } }
    .panel { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:14px; }
    .panel + .panel { margin-top:14px; }
    .ok { color:var(--ok); }
    .warn { color:var(--warn); }
    pre { margin:0; white-space:pre-wrap; word-break:break-word; font:12px/1.5 ui-monospace, Consolas, monospace; color:var(--dim); }
    #document-output { margin-top:12px; border:1px solid var(--line); border-radius:8px; overflow:hidden; background:#05070a; }
    button.action { background:var(--accent); color:#06101c; border:0; border-radius:8px; padding:8px 14px; font:inherit; font-weight:600; cursor:pointer; }
    input[type=range] { width:190px; accent-color: var(--accent); }
    label.small { color:var(--dim); font-size:12px; }
    .note { color:var(--dim); font-size:12px; margin-top:8px; }
</style>
</head>
<body>
<main>
    <h1>pq-games renderer check</h1>
    <p class="lead">The same library the games use, running a live scene. If your browser and GPU support
    WebGPU you should see the backend read <strong>WebGPU (instanced)</strong>; otherwise the canvas fallback
    takes over and the panel explains why.</p>

    <div class="bar">
        <div class="seg" role="group" aria-label="Backend">
            <button id="mode-auto" class="active">Auto</button>
            <button id="mode-gpu">Force WebGPU</button>
            <button id="mode-canvas">Force canvas</button>
        </div>
        <label class="small" for="count">Entities: <span id="count-label">500</span></label>
        <input id="count" type="range" min="100" max="3000" step="100" value="500">
        <div class="stat">
            <div><span>FPS</span><strong id="fps">—</strong></div>
            <div><span>Draw calls</span><strong id="frame-time">—</strong></div>
            <div><span>Backend</span><strong id="backend">—</strong></div>
        </div>
    </div>

    <div class="grid">
        <div>
            <div id="stage-wrap">
                <canvas id="stage-2d" width="1280" height="720"></canvas>
                <canvas id="stage-gpu" width="1280" height="720" style="display:none"></canvas>
            </div>
            <p class="note">Live scene: rotating sprites, shapes and text labels. The WebGPU path draws sprites
            (its batch is sprite-only); shapes and text are drawn by the canvas component drawer, which is what
            runs in the fallback.</p>
            <div class="panel" style="margin-top:14px">
                <h2>Library default renderer (document path)</h2>
                <button class="action" id="render-document">Draw a page once</button>
                <div id="document-status" style="margin-top:10px">not run yet</div>
                <div id="document-output"></div>
            </div>
        </div>
        <div>
            <div class="panel">
                <h2>WebGPU status</h2>
                <div id="gpu-status">checking…</div>
                <div class="bar" style="margin:12px 0 8px">
                    <button class="action" id="probe-gpu">Verify WebGPU pixels</button>
                    <button class="action" id="probe-canvas" style="background:var(--line);color:var(--text)">Canvas pixels</button>
                </div>
                <div id="probe-status" class="note">draws one frame and reads pixels back</div>
            </div>
            <div class="panel">
                <h2>Capabilities</h2>
                <pre id="capabilities">checking…</pre>
            </div>
        </div>
    </div>
</main>
<script src="./demo.js"></script>
</body>
</html>
`;

main().catch((error) => { console.error("webgpu-demo: internal error", error); process.exit(3); });
