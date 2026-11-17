// Small process helper: one place that spawns, streams, times and reports a command.

export interface RunOptions
{
    cwd?: string;
    env?: Record<string, string>;
    // long steps (hugo, the audit) print their own progress, so their output is shown live
    stream?: boolean;
    // prefix for streamed lines, so interleaved tool output stays readable
    label?: string;
}

export interface RunResult
{
    command: string;
    code: number;
    stdout: string;
    stderr: string;
    ms: number;
}

export const run = async (command:string, args:string[], opts:RunOptions = {}) : Promise<RunResult> =>
{
    const started = Date.now();
    const spawnOptions:any = {
        cwd: opts.cwd,
        env: { ...process.env, ...(opts.env ?? {}) },
        stdout: "pipe",
        stderr: "pipe",
    };

    const proc = Bun.spawn([command, ...args], spawnOptions);
    let stdout = "";
    let stderr = "";
    const decoder = new TextDecoder();

    const pump = async (stream:ReadableStream<Uint8Array>, sink:"out"|"err") =>
    {
        for await (const chunk of stream)
        {
            const text = decoder.decode(chunk);
            if(sink === "out") { stdout += text; } else { stderr += text; }
            if(!opts.stream) { continue; }
            for(const line of text.split(/\r?\n/))
            {
                if(line.trim().length === 0) { continue; }
                process.stdout.write(`${opts.label ? `${opts.label} ` : ""}${line}\n`);
            }
        }
    };

    // Both streams are piped, so they exist; the cast only strips Bun's `number | undefined` branch
    // for the "inherit" case, which this never uses.
    await Promise.all([
        pump(proc.stdout as unknown as ReadableStream<Uint8Array>, "out"),
        pump(proc.stderr as unknown as ReadableStream<Uint8Array>, "err"),
    ]);
    const code = await proc.exited;

    return { command: [command, ...args].join(" "), code, stdout, stderr, ms: Date.now() - started };
};

// Does the installed Bun have this built-in command? A missing built-in falls through to the script
// runner and prints "Script not found", which is exactly the difference this asks about.
export const hasBunCommand = async (name:string, cwd:string) : Promise<boolean> =>
{
    const result = await run("bun", [name, "--help"], { cwd });
    if(/Script not found/i.test(result.stdout + result.stderr)) { return false; }
    return result.code === 0;
};
