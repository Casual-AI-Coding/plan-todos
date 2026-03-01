// src/lib/services/index.ts - 服务层入口，导出所有服务模块
export * from "./validation";
export * from "./planService";
export * from "./todoService";
export * from "./circulationService";
export * from "./targetService";
export * from "./milestoneService";

import * as planService from "./planService";
import * as todoService from "./todoService";
import * as circulationService from "./circulationService";
import * as targetService from "./targetService";
import * as milestoneService from "./milestoneService";
import * as validation from "./validation";

export const services = {
  plan: planService,
  todo: todoService,
  circulation: circulationService,
  target: targetService,
  milestone: milestoneService,
  validation,
};
