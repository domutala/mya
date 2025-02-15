import { Project } from "../../database/entitys/Project";
import Koa from "koa";
import { dataSource } from "../../database/index";
import deploy from "../../functions/deploy";

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

  deploy(project.id);
  ctx.body = project;
}
