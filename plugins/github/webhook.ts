import { dataSource } from "../../database/index";
import { Project } from "../../database/entitys/Project";
import deploy from "../../functions/deploy";
import Koa from "koa";
import Router from "@koa/router";
import run from "../../functions/run";

import { Plugin } from "../../interfaces";
import { Config } from "../../database/entitys/Config";

const plugin: Plugin = function (options) {
  async function webhook(ctx: Koa.ParameterizedContext) {
    const repository = dataSource.getRepository(Config);
    const config = await repository.createQueryBuilder("config").getOne();
    const GITHUB_USERNAME = config.data.github.GITHUB_USERNAME;
    const GITHUB_TOKEN = config.data.github.GITHUB_TOKEN;

    const body = ctx.request.body as any;

    if (body.repository) {
      const ref = body.ref.replace("refs/heads/", "") as string;
      const repoName = body.repository.name;
      const repoFullName = body.repository.full_name;
      const url = body.repository.clone_url;

      const repository = dataSource.getRepository(Project);
      const project = await repository
        .createQueryBuilder("project")
        .andWhere(`(source ->> 'name')::varchar = 'github'`)
        .andWhere(`(source -> 'options' ->> 'name')::varchar = '${repoName}'`)
        .andWhere(`(source -> 'options' ->> 'branche')::varchar = '${ref}'`)
        .andWhere(`(source -> 'options' ->> 'url')::varchar = '${url}'`)
        .getOne();

      if (project) {
        const script = `
        git pull https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${repoFullName}.git
      `;
        try {
          await run(script, { path: `${project.id}/code` });
        } catch (error) {
          ctx.status = 500;
          ctx.body = { message: "internal_server_error" };
          return;
        }
        deploy(project.id);
      }
    }

    ctx.body = {};
  }

  async function middleware(ctx: Koa.ParameterizedContext, next: Koa.Next) {
    const excludePaths = ["/github-webhook"];
    if (!excludePaths.includes(ctx.request.path)) {
      const authHeader = ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        ctx.status = 401;
        ctx.body = { message: "invalid_token" };
        return;
      }

      const token = authHeader.split(" ")[1];

      if (token !== process.env.TOKEN) {
        ctx.status = 403;
        ctx.body = { message: "invalid_token" };
        return;
      }
    }

    await next();
  }

  const router = new Router();
  router.post("/webhook", middleware, webhook);

  options.router.use(router.routes(), router.allowedMethods());
};

export default plugin;
