import webhook from "./webhook";
import { Plugin } from "../../interfaces";
import { Project } from "../../database/entitys/Project";
import initProjectCode from "./initProjectCode";
import lodash from "lodash";

const plugin: Plugin = function (options) {
  webhook(options);

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
};

export default plugin;
