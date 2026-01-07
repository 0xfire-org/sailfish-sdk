import { describe, it, expect } from 'vitest';
import { SailfishApi } from '../src/api';
import { GraduatedPoolsQuery, TradesQuery, PoolType, PoolInfo, TokenInfo } from '../src/types';
import { testTiers } from './utils';


type TokenFixture = {
  address: string,
  symbol: string,
  decimals: number,
};

const TOKEN_FIXTURES = {
  WSOL: {
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    decimals: 9,
  } satisfies TokenFixture,
  USDC: {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    decimals: 6,
  } satisfies TokenFixture,
  USDT: {
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    decimals: 6,
  } satisfies TokenFixture,
  USD1: {
    address: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    decimals: 6,
  } satisfies TokenFixture,
} as const;

type PoolFixture = {
  address: string,
  pool_type: string,
  quote_token: TokenFixture,
  base_token: TokenFixture,
};

const POOL_FIXTURES = {
  RAYDIUM_CLMM_SOL_USDC: {
    address: "3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv",
    pool_type: "RaydiumClmm",
    quote_token: TOKEN_FIXTURES.USDC,
    base_token: TOKEN_FIXTURES.WSOL,
  } satisfies PoolFixture,
  RAYDIUM_CLMM_SOL_USDT: {
    address: "3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF",
    pool_type: "RaydiumClmm",
    quote_token: TOKEN_FIXTURES.USDT,
    base_token: TOKEN_FIXTURES.WSOL,
  } satisfies PoolFixture,
  RAYDIUM_CLMM_SOL_USD1: {
    address: "AQAGYQsdU853WAKhXM79CgNdoyhrRwXvYHX6qrDyC1FS",
    pool_type: "RaydiumClmm",
    quote_token: TOKEN_FIXTURES.USD1,
    base_token: TOKEN_FIXTURES.WSOL,
  } satisfies PoolFixture,
} as const;

type TokenFixtureKey = keyof typeof TOKEN_FIXTURES;
type TokenFixturesByKey = { key: TokenFixtureKey, fixture: TokenFixture }[];

const TokenFixturesByKey = {
  all(): TokenFixturesByKey {
    return Object.entries(TOKEN_FIXTURES).map(([key, fixture]) => ({ key: key as TokenFixtureKey, fixture }));
  },
  only(keys: TokenFixtureKey[]): TokenFixturesByKey {
    return TokenFixturesByKey.all().filter(({ key }) => (key in keys))
  },
};

type PoolFixtureKey = keyof typeof POOL_FIXTURES;
type PoolFixturesByKey = { key: PoolFixtureKey, fixture: PoolFixture }[];

const PoolFixturesByKey = {
  all(): PoolFixturesByKey {
    return Object.entries(POOL_FIXTURES).map(([key, fixture]) => ({ key: key as PoolFixtureKey, fixture }));
  },
  only(keys: PoolFixtureKey[]): PoolFixturesByKey {
    return PoolFixturesByKey.all().filter(({ key }) => (keys.includes(key)))
  },
};

function expectTokenInfoMatchesFixture(tokenInfo: TokenInfo, fixture: TokenFixture, logArgsOnError: boolean = true) {
  try {
    expect(tokenInfo).not.toBeInstanceOf(Error);
    expect(tokenInfo.address).toBe(fixture.address);
    expect(tokenInfo.symbol).toBe(fixture.symbol);
    expect(tokenInfo.decimals).toBe(fixture.decimals);
  } catch (err) {
    if (logArgsOnError) {
      console.log(JSON.stringify({ tokenInfo, fixture }, null, 2));
    }
    throw err;
  }
}

function expectPoolInfoMatchesFixture(poolInfo: PoolInfo, fixture: PoolFixture, logArgsOnError: boolean = true) {
  try {
    expect(poolInfo).not.toBeInstanceOf(Error);
    expect(poolInfo.address).toBe(fixture.address);
    expect(poolInfo.pool_type).toBe(fixture.pool_type);
    expectTokenInfoMatchesFixture(poolInfo.quote_token, fixture.quote_token, false);
    expectTokenInfoMatchesFixture(poolInfo.base_token, fixture.base_token, false);
  } catch (err) {
    if (logArgsOnError) {
      console.log(JSON.stringify({ poolInfo, fixture }, null, 2));
    }
    throw err;
  }
}

describe.each(testTiers())('SailfishApi ($type)', ({ type, tier }) => {
  const api = new SailfishApi({ tier });

  it.each(TokenFixturesByKey.all())('should fetch token info ($key=$fixture.address)', async ({ key, fixture }) => {
    const tokenInfo = await api.fetchTokenInfo(fixture.address);
    // console.log('Token info:', JSON.stringify(tokenInfo, null, 2));
    expectTokenInfoMatchesFixture(tokenInfo, fixture);
  });

  it.each(PoolFixturesByKey.all())('should fetch pool info ($key=$fixture.address)', async ({ key, fixture }) => {
    const poolInfo = await api.fetchPoolInfo(fixture.address);
    // console.log('Pool info:', JSON.stringify(poolInfo, null, 2));
    expectPoolInfoMatchesFixture(poolInfo, fixture);
  });

  it('should fetch latest block', async () => {
    const latestBlock = await api.fetchLatestBlock();
    expect(latestBlock).not.toBeInstanceOf(Error);
    expect(typeof latestBlock).toBe('number');
    console.log('Latest block:', latestBlock);
  });

  it('should fetch trades', async () => {
    const latestBlock = await api.fetchLatestBlock();
    expect(latestBlock).not.toBeInstanceOf(Error);
    expect(typeof latestBlock).toBe('number');
    const tradesQuery: TradesQuery = {
      lower_tick: latestBlock as number - 1_000,
      upper_tick: latestBlock as number,
      pool_types: [],
      pool_addresses: ["3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv"], // USDC/SOL pool
      token_addresses: [],
      to_wallets: [],
      from_wallets: [],
    };
    const trades_result = await api.fetchTrades(tradesQuery);
    expect(trades_result).not.toBeInstanceOf(Error);
    if (trades_result instanceof Error) {
      expect.fail("sanity check");
    }
    console.log('Fetch trades:', trades_result);
  });

  it('should throw error for invalid block range', async () => {
    async function fetchTradesWithRangeExpectError(range: Pick<TradesQuery, "lower_tick" | "upper_tick">) {
      try {
        await api.fetchTrades({
          pool_types: [],
          pool_addresses: [],
          token_addresses: [],
          to_wallets: [],
          from_wallets: [],
          ...range,
        });
        expect.fail("Expected to throw error");
      } catch (err) {
        if (!(err instanceof Error)) {
          expect.fail(`Unexpected error (not instance of Error):`, err);
        }
        console.log('Error:', err?.message);
      }

    }

    await fetchTradesWithRangeExpectError({
      lower_tick: 0,
      upper_tick: 1000000000,
    });

    await fetchTradesWithRangeExpectError({
      lower_tick: 1000000000,
      upper_tick: 999999999,
    });

    await fetchTradesWithRangeExpectError({
      lower_tick: -1,
      upper_tick: 1000000001,
    });
  });

  it('should fetch graduated pools', async () => {
    const graduated_block = 374388563;
    const graduatedPoolsQuery: GraduatedPoolsQuery = {
      lower_tick: graduated_block - 990,
      upper_tick: graduated_block + 1,
      pool_types: [PoolType.PumpFunAmm, PoolType.RaydiumLaunchpad],
      pool_addresses: [],
      token_addresses: [],
    };
    const graduatedPools = await api.fetchRawGraduations(graduatedPoolsQuery);
    if (graduatedPools instanceof Error) {
      console.error('Fetch graduated pools Error:', graduatedPools.message);
    }
    expect(graduatedPools).not.toBeInstanceOf(Error);
    if (graduatedPools instanceof Error) {
      expect.fail("sanity check");
    }
    console.log(`Raw graduations - pump: ${graduatedPools.pumpswap_graduations.length}, raydium_amm: ${graduatedPools.raydium_amm_graduations.length}, raydium_cpmm: ${graduatedPools.raydium_cpmm_graduations.length}`);
  }, 5 * 60 * 1000); // 5 minutes timeout
});
