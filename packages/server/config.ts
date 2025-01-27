import { readFile } from "fs/promises";
import { resolve } from "path";
import { z } from "zod";

const serverConfigSchema = z.object({
  name: z.string(),
  transport: z.object({
    command: z.string(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string(), z.string()).optional(),
  }),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;

export interface Config {
  servers: ServerConfig[];
}

export const loadConfig = async (): Promise<Config> => {
  try {
    const configPath = resolve(process.cwd(), "config.json");
    const fileContents = await readFile(configPath, "utf-8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error loading config.json:", error);
    // Return empty config if file doesn't exist
    return { servers: [] };
  }
};
