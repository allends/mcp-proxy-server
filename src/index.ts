import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { ProxyClient } from "./client.js";

const router = express.Router();

router.use(express.json());

const client = await ProxyClient.create();

router.get("/tools", async (req, res) => {
  const tools = await client.handleListTools();

  res.send(tools);
});

router.post("/tool", async (req, res) => {
  console.log(req.body);

  const requestInfo = CallToolRequestSchema.parse(req.body);
  const tool = await client.handleCallTool(requestInfo);

  res.send(tool);
});

router.get("/prompts", async (req, res) => {
  const requestInfo = ListPromptsRequestSchema.parse(req.body);
  const prompts = await client.handleListPrompts(requestInfo);

  res.send(prompts);
});

router.post("/prompt", async (req, res) => {
  const requestInfo = GetPromptRequestSchema.parse(req.body);
  const prompt = await client.handleGetPrompt(requestInfo);

  res.send(prompt);
});

router.get("/resources", async (req, res) => {
  const requestInfo = ListResourcesRequestSchema.parse(req.body);
  const resources = await client.handleListResources(requestInfo);

  res.send(resources);
});

router.post("/resource", async (req, res) => {
  const requestInfo = ReadResourceRequestSchema.parse(req.body);
  const resource = await client.handleReadResource(requestInfo);

  res.send(resource);
});

router.get("/resource/templates", async (req, res) => {
  const requestInfo = ListResourceTemplatesRequestSchema.parse(req.body);
  const templates = await client.handleListResourceTemplates(requestInfo);

  res.send(templates);
});

const app = express();

app.use(router);

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
