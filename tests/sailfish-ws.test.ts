import { describe, it, expect, vi } from 'vitest';
import { SailfishWebsocket } from '../src/websocket';
import { SailfishEventResource, TokenInit, TokenMint, PoolInit, TradeRaw, SailfishMessage } from '../src/types';
import { SailfishTier } from '../src/tier';

describe.sequential('SailfishWebsocket', () => {
  const tier = SailfishTier.legacy();
  // const tier = SailfishTier.free();

  console.log("SailfishTier: ", tier);

  const TEST_TIMEOUT = 1 * 60 * 1000; // 1min

  async function waitUntilWsConnected(ws: SailfishWebsocket) {
    await vi.waitUntil(() => {
      return ws.connected;
    }, { timeout: TEST_TIMEOUT });
  }

  it('should connect', async () => {
    const ws = new SailfishWebsocket({
      tier,
      botName: "sailfish-ws-test",
      callback: (_msg) => { },
      filter: {
        token_addresses: [],
        pool_addresses: [],
        dex_types: [],
      },
    });

    await waitUntilWsConnected(ws);

    expect(ws.enabled).toEqual(true);
    expect(ws.connected).toEqual(true);
    expect(ws.connecting).toEqual(false);

    ws.stop();

    expect(ws.enabled).toEqual(false);
    expect(ws.connected).toEqual(false);
    expect(ws.connecting).toEqual(false);
  }, TEST_TIMEOUT);

  it('should receive every resource type', async () => {
    const tokenInits: TokenInit[] = [];
    const tokenMints: TokenMint[] = [];
    const poolInits: PoolInit[] = [];
    const rawTrades: TradeRaw[] = [];
    const tokenGraduates: PoolInit[] = [];
    const otherMessages: SailfishMessage[] = [];

    const ws = new SailfishWebsocket({
      tier,
      botName: "sailfish-ws-test",
      callback: (message: SailfishMessage) => {
        switch (message.resource) {
          case SailfishEventResource.TokenInits:
            (message.data as TokenInit[]).forEach((tokenInit) => tokenInits.push(tokenInit));
            break;
          case SailfishEventResource.TokenMints:
            (message.data as TokenMint[]).forEach((tokenMint) => tokenMints.push(tokenMint));
            break;
          case SailfishEventResource.PoolInits:
            (message.data as PoolInit[]).forEach((poolInit) => poolInits.push(poolInit));
            break;
          case SailfishEventResource.TradesRaw:
            (message.data as TradeRaw[]).forEach((rawTrade) => rawTrades.push(rawTrade));
            break;
          case SailfishEventResource.TokenGraduates:
            (message.data as PoolInit[]).forEach((graduate) => tokenGraduates.push(graduate));
            break;
          default:
            otherMessages.push(message);
            break;
        }
      },
      filter: {
        token_addresses: [],
        pool_addresses: [],
        dex_types: ["PumpFun", "PumpSwap"],
      },
    });

    await waitUntilWsConnected(ws);

    await vi.waitUntil(() => {
      const emptyNames: string[] = [];
      const checkEmpty = <T>(arr: T[], name: string) => {
        if (arr.length === 0) emptyNames.push(name);
      };

      checkEmpty(tokenInits, "tokenInits");
      checkEmpty(tokenMints, "tokenMints");
      checkEmpty(poolInits, "poolInits");
      checkEmpty(rawTrades, "rawTrades");
      // checkEmpty(tokenGraduates, "tokenGraduates");

      if (emptyNames.length === 0) {
        return true;
      } else {
        return false;
      }
    }, { timeout: TEST_TIMEOUT });

    expect(tokenInits.length).toBeGreaterThan(0);
    expect(tokenMints.length).toBeGreaterThan(0);
    expect(poolInits.length).toBeGreaterThan(0);
    expect(rawTrades.length).toBeGreaterThan(0);
    // expect(tokenGraduates.length).toBeGreaterThan(0);
    expect(otherMessages).toEqual([]);
  }, TEST_TIMEOUT);
});
