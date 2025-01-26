import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { loadConfig, ServerConfig } from "./config.js";
import {
  ListToolsRequestSchema,
  Tool,
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListPromptsResultSchema,
  ListResourcesRequestSchema,
  ListResourcesResultSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
export interface ConnectedClient {
  client: Client;
  cleanup: () => Promise<void>;
  name: string;
}

export const createClients = async (
  servers: ServerConfig[]
): Promise<ConnectedClient[]> => {
  const clients: ConnectedClient[] = [];

  for (const server of servers) {
    console.log(`Connecting to server: ${server.name}`);

    try {
      const envVariables: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined) {
          envVariables[key] = value;
        }
      }

      const transport = new StdioClientTransport({
        command: server.transport.command,
        args: server.transport.args,
        env: {
          ...envVariables,
          ...server.transport.env,
        },
      });

      const client = new Client(
        {
          name: "mcp-proxy-client",
          version: "1.0.0",
        },
        {
          capabilities: {
            prompts: {},
            resources: { subscribe: true },
            tools: {},
          },
        }
      );

      await client.connect(transport);
      console.log(`Connected to server: ${server.name}`);

      clients.push({
        client,
        name: server.name,
        cleanup: async () => {
          await transport.close();
        },
      });
    } catch (error) {
      console.error(`Failed to connect to ${server.name}:`, error);
    }
  }

  return clients;
};

export class ProxyClient {
  private connectedClients: ConnectedClient[] = [];
  private toolToClientMap = new Map<string, ConnectedClient>();
  private resourceToClientMap = new Map<string, ConnectedClient>();
  private promptToClientMap = new Map<string, ConnectedClient>();

  private async initialize() {
    const config = await loadConfig();
    this.connectedClients = await createClients(config.servers);
    console.log(`Connected to ${this.connectedClients.length} servers`);
  }

  public static async create() {
    const client = new ProxyClient();
    await client.initialize();
    return client;
  }

  private constructor() {}

  async handleListTools(request?: z.infer<typeof ListToolsRequestSchema>) {
    const allTools: Tool[] = [];
    this.toolToClientMap.clear();

    for (const connectedClient of this.connectedClients) {
      try {
        const result = await connectedClient.client.listTools();

        if (result.tools) {
          const toolsWithSource = result.tools.map((tool) => {
            this.toolToClientMap.set(tool.name, connectedClient);
            return {
              ...tool,
              description: `[${connectedClient.name}] ${
                tool.description || ""
              }`,
            };
          });
          allTools.push(...toolsWithSource);
        }
      } catch (error) {
        console.error(
          `Error fetching tools from ${connectedClient.name}:`,
          error
        );
      }
    }

    return { tools: allTools };
  }

  async handleCallTool(request: z.infer<typeof CallToolRequestSchema>) {
    const { name, arguments: args } = request.params;
    const clientForTool = this.toolToClientMap.get(name);

    if (!clientForTool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      console.log("Forwarding tool call:", name);
      return await clientForTool.client.callTool(request.params);
    } catch (error) {
      console.error(`Error calling tool through ${clientForTool.name}:`, error);
      throw error;
    }
  }

  async handleGetPrompt(request: z.infer<typeof GetPromptRequestSchema>) {
    const { name } = request.params;
    const clientForPrompt = this.promptToClientMap.get(name);

    if (!clientForPrompt) {
      throw new Error(`Unknown prompt: ${name}`);
    }

    try {
      console.log("Forwarding prompt request:", name);
      return await clientForPrompt.client.getPrompt(request.params);
    } catch (error) {
      console.error(
        `Error getting prompt from ${clientForPrompt.name}:`,
        error
      );
      throw error;
    }
  }

  async handleListPrompts(request: z.infer<typeof ListPromptsRequestSchema>) {
    const allPrompts: z.infer<typeof ListPromptsResultSchema>["prompts"] = [];
    this.promptToClientMap.clear();

    for (const connectedClient of this.connectedClients) {
      try {
        const result = await connectedClient.client.listPrompts(request.params);

        if (result.prompts) {
          const promptsWithSource = result.prompts.map((prompt) => {
            this.promptToClientMap.set(prompt.name, connectedClient);
            return {
              ...prompt,
              description: `[${connectedClient.name}] ${
                prompt.description || ""
              }`,
            };
          });
          allPrompts.push(...promptsWithSource);
        }
      } catch (error) {
        console.error(
          `Error fetching prompts from ${connectedClient.name}:`,
          error
        );
      }
    }

    return {
      prompts: allPrompts,
      nextCursor: request.params?.cursor,
    };
  }

  async handleListResources(
    request: z.infer<typeof ListResourcesRequestSchema>
  ) {
    const allResources: z.infer<typeof ListResourcesResultSchema>["resources"] =
      [];
    this.resourceToClientMap.clear();

    for (const connectedClient of this.connectedClients) {
      try {
        const result = await connectedClient.client.listResources(
          request.params
        );

        console.log("Result:", result);

        if (result.resources) {
          result.resources.forEach((resource) => {
            this.resourceToClientMap.set(resource.uri, connectedClient);
          });
          allResources.push(...result.resources);
        }
      } catch (error) {
        console.error(
          `Error fetching resources from ${connectedClient.name}:`,
          error
        );
      }
    }

    return {
      resources: allResources,
      nextCursor: undefined,
    };
  }

  async handleReadResource(request: z.infer<typeof ReadResourceRequestSchema>) {
    const { uri } = request.params;
    const clientForResource = this.resourceToClientMap.get(uri);

    if (!clientForResource) {
      throw new Error(`Unknown resource: ${uri}`);
    }

    try {
      return await clientForResource.client.readResource(request.params);
    } catch (error) {
      console.error(
        `Error reading resource from ${clientForResource.name}:`,
        error
      );
      throw error;
    }
  }

  async handleListResourceTemplates(
    request: z.infer<typeof ListResourceTemplatesRequestSchema>
  ) {
    const allTemplates: ResourceTemplate[] = [];

    for (const connectedClient of this.connectedClients) {
      try {
        const result = await connectedClient.client.listResourceTemplates(
          request.params
        );

        if (result.resourceTemplates) {
          const templatesWithSource = result.resourceTemplates.map(
            (template) => ({
              ...template,
              name: `[${connectedClient.name}] ${template.name || ""}`,
              description: template.description
                ? `[${connectedClient.name}] ${template.description}`
                : undefined,
            })
          );
          allTemplates.push(...templatesWithSource);
        }
      } catch (error) {
        console.error(
          `Error fetching resource templates from ${connectedClient.name}:`,
          error
        );
      }
    }

    return {
      resourceTemplates: allTemplates,
      nextCursor: request.params?.cursor,
    };
  }

  async close() {
    await Promise.all(this.connectedClients.map(({ cleanup }) => cleanup()));
  }
}
