import Koa from "koa";
import Router from "@koa/router";

export interface IStep {
  env?: { [key: string]: any };
  script: string;
}

export interface IDeploy {
  env?: { [key: string]: any };
  steps: {
    [name: string]: IStep;
  };
}

export type Plugin = (options: { app: Koa; router: Router }) => void;
