import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ProxyServer } from "./server.js";
import { RemoteProxyServer } from "./remoteServer.js";

try {
  const server = await RemoteProxyServer.create();
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
