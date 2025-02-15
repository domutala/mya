import { Project } from "../../database/entitys/Project";
import Koa from "koa";
import { dataSource } from "../../database/index";
import deploy from "../../functions/deploy";

export default async function (ctx: Koa.ParameterizedContext) {
  const repository = dataSource.getRepository(Project);
  const projects = await repository.createQueryBuilder("project").getMany();

  ctx.body = projects;
}
