import { z } from "zod";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

const backendRoot = path.resolve(__dirname, "../..");

const loadEnvFiles = (): void => {
  const files = [
    { name: ".env.example", override: false },
    { name: ".env", override: true },
    { name: ".env.local", override: true },
  ];

  files.forEach((file) => {
    const filePath = path.join(backendRoot, file.name);
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath, override: file.override });
    }
  });
};

loadEnvFiles();

const cleanStringValue = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  const wrappedInSingleQuotes = trimmed.startsWith("'") && trimmed.endsWith("'");
  const wrappedInDoubleQuotes = trimmed.startsWith("\"") && trimmed.endsWith("\"");

  if (wrappedInSingleQuotes || wrappedInDoubleQuotes) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  POSTGRES_URI_URI: z.preprocess(cleanStringValue, z.string().url()),
  FRONTEND_URL: z.preprocess(cleanStringValue, z.string().url()),
  API_URL: z.preprocess(cleanStringValue, z.string().url()),
  LOG_LEVEL: z.preprocess(cleanStringValue, z.enum(["error", "warn", "info", "debug"]))
    .default("info"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  SMTP_HOST: z.preprocess(cleanStringValue, z.string().min(2)),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.preprocess(cleanStringValue, z.string().min(2)),
  SMTP_PASS: z.preprocess(cleanStringValue, z.string().min(8)),
  EMAIL_FROM: z.preprocess(cleanStringValue, z.string().email()),
  ADMIN_NAME: z.string().min(2).default("System Administrator"),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_PASSWORD: z.string().min(8).default("ChangeMeNow123!"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
