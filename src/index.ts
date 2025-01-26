import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ProxyServer } from "./server.js";

async function main() {
  const transport = new StdioServerTransport();

  const server = await ProxyServer.create();
  await server.connect(transport);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
