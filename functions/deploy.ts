import { existsSync, readFileSync } from "fs";
import { IDeploy } from "interfaces";
import yaml from "js-yaml";
import { join } from "path";
import run from "./run";

export default function (id: string) {
  const projectPath = join(process.cwd(), ".projects", id);

  if (!existsSync(join(projectPath, "code/Deploy.yml"))) {
    throw new Error("Deploy file not found");
  }

  const fileContent = readFileSync(
    join(projectPath, "code/Deploy.yml"),
    "utf8",
  );
  const deployCode = yaml.load(fileContent) as IDeploy;

  runScript(0);
  async function runScript(index: number) {
    const step = deployCode.steps[Object.keys(deployCode.steps)[index]];
    const script = `
      #!/bin/bash
      ${step.script}
    `;

    try {
      await run(script, {
        env: { ...(deployCode.env || {}), ...(step.env || {}) },
        path: id,
      });

      if (index + 1 < Object.keys(deployCode.steps).length) {
        runScript(index + 1);
      }
    } catch (error) {
      throw error;
    }
  }
}
