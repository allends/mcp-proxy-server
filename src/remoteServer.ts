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

export class RemoteProxyServer extends Server {
  // use this to create a new instance
  public static async create() {
    return new RemoteProxyServer();
  }

  private constructor() {
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

    this.setHandlers();
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
    const response = await fetch("http://localhost:3001/tools");
    const data = await response.json();
    return data;
  }

  private async handleCallTool(request: z.infer<typeof CallToolRequestSchema>) {
    console.error("Forwarding tool call:", request);
    const response = await fetch(`http://localhost:3001/tool`, {
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
    const response = await fetch(`http://localhost:3001/prompt`, {
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
    const response = await fetch(`http://localhost:3001/prompts`, {
      method: "GET",
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
    const response = await fetch(`http://localhost:3001/resources`, {
      method: "GET",
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
    const response = await fetch(`http://localhost:3001/resource`, {
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
    const response = await fetch(`http://localhost:3001/resource/templates`, {
      method: "GET",
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
