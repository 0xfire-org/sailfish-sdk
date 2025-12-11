import { SailfishTier, SailfishTierType } from "../src/tier";
import * as dotenv from "dotenv";

export function testTiers(): { type: SailfishTierType, tier: SailfishTier }[] {
  const apiKey = testApiKey();
  return [
    SailfishTier.free({ apiKey }),
    SailfishTier.basic({ apiKey }),
  ].map((tier) => ({ type: tier.type, tier }));
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
