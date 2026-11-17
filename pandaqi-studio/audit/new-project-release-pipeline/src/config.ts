import { join, resolve } from "node:path";

// Everything is derived from this file's location, so the pipeline can be started from any
// working directory (`bun run release <game>` inside the folder, or `bun run <path> <game>` from
// the studio root) and still find the same project.
export const pipelineDir = resolve(import.meta.dir, "..");
export const auditDir = resolve(pipelineDir, "..");
export const studioDir = resolve(auditDir, "..");
export const contentDir = join(studioDir, "content");
export const assetsDir = join(studioDir, "assets");
export const gamesDir = join(assetsDir, "games");
export const auditArtifactsDir = join(studioDir, "audit-artifacts");
export const siteDir = join(auditArtifactsDir, "site");
export const rendersDir = join(auditArtifactsDir, "renders");
export const auditReportPath = join(auditArtifactsDir, "report.json");
export const promptsDir = join(pipelineDir, "prompts");
export const cacheDir = join(pipelineDir, ".cache");
export const outputDir = (project: string) => join(auditArtifactsDir, "release", slugPath(project));

// `chiptales/noble-flood` -> `chiptales-noble-flood` (one folder per released project)
export const slugPath = (project: string) => project.split("/").filter(Boolean).join("-");
export const projectName = (project: string) => project.split("/").filter(Boolean).pop() ?? project;
