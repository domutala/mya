import { spawn } from "child_process";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import randomatic from "randomatic";

export default function (
  script: string,
  options: {
    env?: NodeJS.ProcessEnv;
    path?: string;
    onError?: (err: any) => void;
    onData?: (err: any) => void;
  },
) {
  return new Promise<number>((resolve, reject) => {
    let projectPath = join(process.cwd(), ".projects");
    if (options.path) projectPath = join(projectPath, options.path);

    const tempScriptPath = join(projectPath, `temp_${randomatic("a0", 16)}.sh`);

    writeFileSync(tempScriptPath, script);

    const processus = spawn("sh", [tempScriptPath], {
      cwd: projectPath,
      env: options.env,
    });

    processus.stdout.on("data", (data) => {
      if (options.onData) options.onData(`${data}`);
      console.log(`${data}`);
    });

    processus.stderr.on("data", (data) => {
      if (options.onError) options.onError(`${data}`);
      console.error(`${data}`);
    });

    process.on("error", (err) => {
      processus.kill();
      console.error(`${err.message}`);
      reject(err);
    });

    processus.on("close", (code) => {
      if (existsSync(tempScriptPath)) unlinkSync(tempScriptPath);
      resolve(code);
    });
  });
}
