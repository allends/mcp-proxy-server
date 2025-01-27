#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "./mcpServer.js";

try {
  const server = new McpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
} catch (error) {
  console.error("Server error:", error);
  process.exit(1);
}
