import { Plugin } from "../interfaces";
import github from "./github";

const plugin: Plugin = function (options) {
  github(options);
};

export default plugin;
