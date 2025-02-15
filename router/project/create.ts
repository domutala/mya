import { Project } from "../../database/entitys/Project";
import Koa from "koa";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export default async function (ctx: Koa.ParameterizedContext) {
  const body = ctx.request.body as Project;

  const project = new Project();
  project.name = body.name;
  project.source = body.source;
  project.env = body.env;

  await project.save();

  const projectPath = join(process.cwd(), ".projects", project.id);
  if (!existsSync(projectPath)) {
    mkdirSync(join(projectPath, "code"), { recursive: true });
  }

  ctx.app.emit("mya:project:create", project);

  ctx.body = project;
}
