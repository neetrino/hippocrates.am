import { spawn } from "node:child_process";

/** Runs an API script with the current process env. The script repeats the loopback guard. */
export function runApiScript(script: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "pnpm",
      ["--filter", "@hippocrates/api", "exec", "ts-node", "-r", "./src/register-prisma-ts.cjs", script, ...args],
      { stdio: "inherit", env: process.env, shell: process.platform === "win32" },
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`E2E script ${script} exited ${code ?? "null"}.`));
    });
  });
}
