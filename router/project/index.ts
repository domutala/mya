import Router from "@koa/router";
import create from "./create";
import update from "./update";
import remove from "./remove";
import deploy from "./deploy";
import get from "./get";
import list from "./list";

const router = new Router({ prefix: "/project" });

router.post("/", create);
router.delete("/:id", remove);
router.put("/:id", update);
router.get("/deploy/:id", deploy);
router.get("/:id", get);
router.get("/", list);

export default router;
