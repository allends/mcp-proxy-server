import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Router } from "express";
import { ProxyClient } from "./client/index.js";

const router = Router();

const client = await ProxyClient.create();

router.post("/tools", async (req, res) => {
  const requestInfo = ListToolsRequestSchema.parse(req.body);
  const tools = await client.handleListTools(requestInfo);

  res.send(tools);
});

router.post("/tool", async (req, res) => {
  const requestInfo = CallToolRequestSchema.parse(req.body);
  const tool = await client.handleCallTool(requestInfo);

  res.send(tool);
});

router.post("/prompts", async (req, res) => {
  const requestInfo = ListPromptsRequestSchema.parse(req.body);
  const prompts = await client.handleListPrompts(requestInfo);

  res.send(prompts);
});

router.post("/prompt", async (req, res) => {
  const requestInfo = GetPromptRequestSchema.parse(req.body);
  const prompt = await client.handleGetPrompt(requestInfo);

  res.send(prompt);
});

router.post("/resources", async (req, res) => {
  const requestInfo = ListResourcesRequestSchema.parse(req.body);
  const resources = await client.handleListResources(requestInfo);

  res.send(resources);
});

router.post("/resource", async (req, res) => {
  const requestInfo = ReadResourceRequestSchema.parse(req.body);
  const resource = await client.handleReadResource(requestInfo);

  res.send(resource);
});

router.post("/resource/templates", async (req, res) => {
  const requestInfo = ListResourceTemplatesRequestSchema.parse(req.body);
  const templates = await client.handleListResourceTemplates(requestInfo);

  res.send(templates);
});

export default router;
