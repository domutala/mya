import { spawn } from "child_process";
import { unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import randomatic from "randomatic";

export default function (
  script: string,
  options: { id: string; cb: () => void; onError?: (err: any) => void },
) {
  let scriptDotSh = script;
  const projectPath = join(process.cwd(), ".projects", options.id);

  const tempScriptPath = join(
    projectPath,
    "code",
    `tem_${randomatic("a0", 32)}.sh`,
  );

  writeFileSync(tempScriptPath, scriptDotSh);

  const processus = spawn("sh", [tempScriptPath], {
    cwd: join(projectPath, "code"),
  });

  processus.stdout.on("data", (data) => {
    console.log(`${data}`);
  });

  processus.stderr.on("data", (data) => {
    console.log(data, "*-*-*-*");

    if (options.onError) options.onError(`${data}`);
    console.error(`${data}`);
  });

  processus.on("close", (code) => {
    unlinkSync(tempScriptPath);
    options.cb();
  });
}
