import { Config } from "../database/entitys/Config";
import { dataSource } from "../database";
import Router from "@koa/router";

const router = new Router({ prefix: "/config" });

router.get("/", async (ctx) => {
  const repository = dataSource.getRepository(Config);
  let config = await repository.createQueryBuilder("config").getOne();

  if (!config) {
    config = new Config();
    await config.save();
  }

  ctx.body = config.data;

  await config.save();
});

export default router;
