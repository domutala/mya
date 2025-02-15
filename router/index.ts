import Router from "@koa/router";
import project from "./project";

const router = new Router();

router.use(project.routes(), project.allowedMethods());

export default router;
