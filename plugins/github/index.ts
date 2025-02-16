import webhook from "./webhook";
import { IConfig, Plugin } from "../../interfaces";
import { Project } from "../../database/entitys/Project";
import initProjectCode from "./initProjectCode";
import lodash from "lodash";
import Router from "@koa/router";
import { dataSource } from "../../database";
import { Config } from "../../database/entitys/Config";

declare module "../../interfaces" {
  interface IConfig {
    github: {
      GITHUB_USERNAME: string;
      GITHUB_TOKEN: string;
    };
  }
}

const plugin: Plugin = function (options) {
  const router = new Router({ prefix: "/github" });

  webhook({ ...options, router });

  // modify github configurations
  router.post("/config", async (ctx) => {
    const repository = dataSource.getRepository(Config);
    let config = await repository.createQueryBuilder("config").getOne();

    const body = ctx.request.body as any;

    config.data.github ||= {} as any;
    config.data.github.GITHUB_USERNAME = body.GITHUB_USERNAME;
    config.data.github.GITHUB_TOKEN = body.GITHUB_TOKEN;

    if (typeof config.data.github.GITHUB_TOKEN !== "string") {
      ctx.status = 400;
      ctx.body = { error: "GITHUB_TOKEN_must_be_a_string" };
      return;
    }
    if (typeof config.data.github.GITHUB_USERNAME !== "string") {
      ctx.status = 400;
      ctx.body = { error: "GITHUB_USERNAME_must_be_a_string" };
      return;
    }

    await config.save();

    ctx.body = config.data.github;
  });

  options.app.on("mya:project:create", (project: Project) => {
    if (project.source.name === "github") initProjectCode(project);
  });

  options.app.on(
    "mya:project:update",
    (project: Project, oldProject: Project) => {
      if (project.source.name === "github") {
        const isSourceUpdate = lodash.isEqual(
          project.source,
          oldProject.source,
        );

        if (!isSourceUpdate) initProjectCode(project);
      }
    },
  );

  options.router.use(router.routes(), router.allowedMethods());
};

export default plugin;
