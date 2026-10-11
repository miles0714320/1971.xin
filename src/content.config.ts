import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// 工具库：一个 md 文件 = 一个工具条目
const tools = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tools" }),
  schema: z.object({
    name: z.string(),
    url: z.string().url(),
    category: z.string(),
    tagline: z.string(),
    platform: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

// 文章：一个 md 文件 = 一篇文章
const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = { tools, articles };
