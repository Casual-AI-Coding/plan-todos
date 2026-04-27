export interface CreateTagInput {
  name: string;
  color: string;
  description?: string;
}

export interface UpdateTagInput {
  id: string;
  name?: string;
  color?: string;
  description?: string;
}
