import Router from "@koa/router";
import project from "./project";
import config from "./config";

const router = new Router();

router.use(project.routes(), project.allowedMethods());
router.use(config.routes(), config.allowedMethods());

export default router;
