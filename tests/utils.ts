import type { SailfishConfig } from "../src/types";
import * as dotenv from "dotenv";

export type TestEndpoint = { name: string; config: SailfishConfig };

export function testEndpoints(): TestEndpoint[] {
  const apiKey = testApiKey();
  return [
    { name: "free", config: { url: "https://free.sailfish.solanavibestation.com", apiKey } },
    { name: "basic", config: { url: "https://basic.sailfish.solanavibestation.com", apiKey } },
  ];
}

export function testApiKey(): string {
  dotenv.config({ path: '.env.test' });

  const apiKey = process.env.API_KEY;
  if (typeof apiKey !== "string") {
    throw new Error(`process.env.API_KEY not string: ${apiKey}`);
  }
  if (apiKey.length == 0) {
    throw new Error(`process.env.API_KEY is empty`);
  }
  return apiKey;
}
