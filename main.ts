import Koa from "koa";
import dotenv from "dotenv";
import bodyParser from "koa-bodyparser";
import crypto from "crypto";
import { initDatabase } from "./database";
import router from "./router";
import plugins from "./plugins";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

async function bootstrap() {
  if (!existsSync(join(process.cwd(), ".projects"))) {
    mkdirSync(join(process.cwd(), ".projects"));
  }

  dotenv.config();
  await initDatabase();

  const app = new Koa();

  app.use(bodyParser());
  app.use(async (ctx, next) => {
    if (ctx.request.path === "/github-webhook") {
      const signature = ctx.headers["x-hub-signature-256"];
      if (!signature) {
        ctx.status = 401;
        ctx.body = { error: "Signature manquante" };
        return;
      }

      const payload = JSON.stringify(ctx.request.body);
      const hmac = crypto
        .createHmac("sha256", process.env.TOKEN)
        .update(payload)
        .digest("hex");
      const expectedSignature = `sha256=${hmac}`;

      if (signature !== expectedSignature) {
        ctx.status = 403;
        ctx.body = { error: "Signature invalide" };
        return;
      }
    }
    await next();
  });

  app.use(router.routes()).use(router.allowedMethods());

  plugins({ app, router });

  router.stack.forEach((route) => {
    if (route.methods.length) {
      console.log(route.methods, route.path);
    }
  });

  app.listen(process.env.PORT, () => {
    console.log(`🚀 http://localhost:${process.env.PORT}`);
  });
}

bootstrap();
