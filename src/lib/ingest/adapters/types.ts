import type { RawVideo } from "@/lib/types";

export interface SourceAdapter {
  key: string;
  fetchRecent(listUrl: string): Promise<RawVideo[]>;
}
