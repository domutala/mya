import { Project } from "../../database/entitys/Project";
import Koa from "koa";
import { dataSource } from "../../database/index";

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

  const old = { ...project };
  const body = ctx.request.body as Project;

  project.name = body.name;
  project.source = body.source;
  project.env = body.env;

  await project.save();
  ctx.body = project;

  ctx.app.emit("mya:project:update", project, old);
}
