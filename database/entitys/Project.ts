import { Column, Entity } from "typeorm";
import { Base } from "./Base";

@Entity()
export class Project extends Base {
  @Column()
  name: string;

  @Column({ type: "jsonb" })
  source: {
    name: "github";
    options: {
      url: string;
      name: string;
      branche: string;
    };
  };

  @Column({ type: "jsonb", default: {} })
  env: NodeJS.ProcessEnv;
}
