import { Project } from "../../database/entitys/Project";
import Koa from "koa";
import { join } from "path";
import { dataSource } from "../../database/index";
import lodash from "lodash";
import run from "../../functions/run";
import { existsSync } from "fs";

export default async function (ctx: Koa.ParameterizedContext) {
  const id = ctx.params.id;

  const repository = dataSource.getRepository(Project);
  const project = await repository
    .createQueryBuilder("project")
    .andWhere(`id = '${id}'`)
    .getOne();

  if (!project) {
    ctx.status = 404;
    ctx.body = { message: "project_not_found" };
    return;
  }

  await project.remove();

  try {
    const projectPath = join(process.cwd(), ".projects");
    if (existsSync(join(projectPath, id))) {
      await run(`rm -r -f ./${id}`, {});
    }
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { message: "internal_server_error" };
    return;
  }

  ctx.body = { ...project, id };
}
