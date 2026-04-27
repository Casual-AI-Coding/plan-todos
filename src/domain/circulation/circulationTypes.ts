import type { CirculationType, PeriodicFrequency } from "@/lib/types";

export interface CreateCirculationInput {
  title: string;
  circulation_type: CirculationType;
  frequency?: PeriodicFrequency;
  target_count?: number;
}

export interface UpdateCirculationInput {
  id: string;
  title?: string;
  circulation_type?: CirculationType;
  frequency?: PeriodicFrequency;
  target_count?: number;
}
