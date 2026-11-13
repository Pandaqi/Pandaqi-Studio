export type Kind = "game" | "board" | "rules" | "other";
export type Contract = "rulebook" | "generator" | "digital" | "none";

export interface ManifestEntry
{
    url: string;
    kind: Kind;
    contract: Contract;

    scripts: string[];
    links: string[];

    examples: string[];
    tables: string[];

    bodyClass: string;
    hasRulebookContent: boolean;

    bundleText: string;

    isDraftProject: boolean;
    legacyPath: boolean;
    missing: boolean;

    sourceMd: string;
    htmlPath: string;
}

export interface Failure
{
    code: string;
    contract: Contract;
    message: string;
    where?: string;
}

export interface RenderInfo
{
    w: number;
    h: number;
    inkRatio: number;
    thumb: string | null;
    error?: string;
}

export interface PageResult
{
    url: string;
    kind: Kind;
    contract: Contract;
    status: "pass" | "fail" | "skip";
    durationMs: number;
    failures: Failure[];
    warnings: string[];
    artifacts: string[];
    profiles?: string[];
    needsManual?: boolean;
    skippedReason?: string;
}

export interface ReportData
{
    version: number;
    generatedAt: string;
    seed: string;
    build: { exitCode: number; durationMs: number; cached: boolean; log: string };
    summary: {
        pages: number;
        pass: number;
        fail: number;
        skip: number;
        warnings: number;
        failuresByCode: Record<string, number>;
    };
    results: PageResult[];
    needsManual: { url: string; reason: string }[];
    unreviewedProjects?: string[];
}
