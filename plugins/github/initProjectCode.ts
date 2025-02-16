import { Project } from "../../database/entitys/Project";
import { join } from "path";
import { existsSync } from "fs";
import run from "../../functions/run";
import { dataSource } from "../../database";
import { Config } from "../../database/entitys/Config";

export default function (project: Project) {
  return new Promise<Project>((resolve, reject) => {
    const repository = dataSource.getRepository(Config);
    repository
      .createQueryBuilder("config")
      .getOne()
      .then((config) => {
        const GITHUB_USERNAME = config.data.github.GITHUB_USERNAME;
        const GITHUB_TOKEN = config.data.github.GITHUB_TOKEN;

        let url = project.source.options.url.replace(
          "https://",
          `https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@`,
        );

        // supprimer tous le contenu de code s'il existe
        if (
          existsSync(join(process.cwd(), ".projects", `${project.id}/code`))
        ) {
          run("rm -r ./*", { path: `${project.id}/code` })
            .then(() => fn())
            .catch((error) => reject(error));
        } else fn();

        function fn() {
          const script = `
        git clone -b ${project.source.options.branche} ${url} ./.tempcode
        rsync -av --progress ./.tempcode/ ./code
        rm -r ./.tempcode
      `;
          run(script, { path: project.id })
            .then(() => resolve(project))
            .catch((error) => reject(error));
        }
      });
  });
}
