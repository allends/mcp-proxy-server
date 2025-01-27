import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { networkInterfaces } from "os";

export class McpServer extends Server {
  private localIpAddress: string;
  constructor() {
    super(
      {
        name: "mcp-proxy-server",
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

    this.localIpAddress = this.getLocalIpAddress();
    this.setHandlers();

    console.error(`Local IP Address: ${this.localIpAddress}`);
  }

  private getLocalIpAddress(): string {
    const nets = networkInterfaces();

    for (const name of Object.keys(nets)) {
      for (const net of nets[name] ?? []) {
        if (!net.internal && net.family === "IPv4") {
          return `http://${net.address}:3001`;
        }
      }
    }
    return "http://localhost:3001"; // Fallback to localhost
  }

  private setHandlers() {
    // List Tools Handler
    this.setRequestHandler(ListToolsRequestSchema, (request) =>
      this.handleListTools(request)
    );

    // Call Tool Handler
    this.setRequestHandler(CallToolRequestSchema, (request) =>
      this.handleCallTool(request)
    );

    // Get Prompt Handler
    this.setRequestHandler(GetPromptRequestSchema, (request) =>
      this.handleGetPrompt(request)
    );

    // List Prompts Handler
    this.setRequestHandler(ListPromptsRequestSchema, (request) =>
      this.handleListPrompts(request)
    );

    // List Resources Handler
    this.setRequestHandler(ListResourcesRequestSchema, (request) =>
      this.handleListResources(request)
    );

    // Read Resource Handler
    this.setRequestHandler(ReadResourceRequestSchema, (request) =>
      this.handleReadResource(request)
    );

    // List Resource Templates Handler
    this.setRequestHandler(ListResourceTemplatesRequestSchema, (request) =>
      this.handleListResourceTemplates(request)
    );
  }

  private async handleListTools(
    request: z.infer<typeof ListToolsRequestSchema>
  ) {
    const response = await fetch(`${this.localIpAddress}/tools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return data;
  }

  private async handleCallTool(request: z.infer<typeof CallToolRequestSchema>) {
    console.error("Forwarding tool call:", request);
    const response = await fetch(`${this.localIpAddress}/tool`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return data;
  }

  private async handleGetPrompt(
    request: z.infer<typeof GetPromptRequestSchema>
  ) {
    const response = await fetch(`${this.localIpAddress}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return data;
  }

  private async handleListPrompts(
    request: z.infer<typeof ListPromptsRequestSchema>
  ) {
    const response = await fetch(`${this.localIpAddress}/prompts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return data;
  }

  private async handleListResources(
    request: z.infer<typeof ListResourcesRequestSchema>
  ) {
    const response = await fetch(`${this.localIpAddress}/resources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return data;
  }

  private async handleReadResource(
    request: z.infer<typeof ReadResourceRequestSchema>
  ) {
    const response = await fetch(`${this.localIpAddress}/resource`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return data;
  }

  private async handleListResourceTemplates(
    request: z.infer<typeof ListResourceTemplatesRequestSchema>
  ) {
    const response = await fetch(`${this.localIpAddress}/resource/templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    return data;
  }

  async close() {
    await super.close();
  }
}
