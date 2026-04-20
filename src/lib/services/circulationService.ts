export { circulationDomainService } from "@/domain/circulation/circulationService";
export type { CirculationStats } from "@/domain/circulation/circulationService";

import { circulationDomainService } from "@/domain/circulation/circulationService";

export const calculateCirculationStats = circulationDomainService.calculateStats;
export const getCirculationTrend = circulationDomainService.getTrend;
export const getHighestCirculationDay = circulationDomainService.getHighestDay;
export const getLowestCirculationDay = circulationDomainService.getLowestDay;