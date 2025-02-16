import { Column, Entity } from "typeorm";
import { Base } from "./Base";
import { IConfig } from "@/interfaces";

@Entity()
export class Config extends Base {
  @Column({ type: "jsonb", default: {} })
  data: IConfig;
}
