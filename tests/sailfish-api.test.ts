import { describe, it, expect } from 'vitest';
import { SailfishApi } from '../src/api';
import { PRODUCTION_API_URL } from '../src/constants';
import { GraduatedPoolsQuery, TradesQuery, PoolType } from '../src/types';

describe('SailfishApi', () => {
  const api = new SailfishApi(PRODUCTION_API_URL);

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

  it('should return an error for invalid block range', async () => {
    let tradesQuery: TradesQuery = {
      lower_tick: 0,
      upper_tick: 1000000000,
      pool_types: [],
      pool_addresses: [],
      token_addresses: [],
      to_wallets: [],
      from_wallets: [],
    };
    const trades = await api.fetchTrades(tradesQuery);
    expect(trades).toBeInstanceOf(Error);
    console.log('Error:', trades?.message);

    tradesQuery.lower_tick = 1000000000;
    tradesQuery.upper_tick = 999999999;
    const trades2 = await api.fetchTrades(tradesQuery);
    expect(trades2).toBeInstanceOf(Error);
    console.log('Error:', trades2?.message);


    tradesQuery.lower_tick = -1;
    tradesQuery.upper_tick = 1000000001;
    const trades3 = await api.fetchTrades(tradesQuery);
    expect(trades3).toBeInstanceOf(Error);
    console.log('Error:', trades3?.message);

  });

  it('should fetch pool info', async () => {
    const poolInfo = await api.fetchPoolInfo("3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv");
    expect(poolInfo).not.toBeInstanceOf(Error);
    console.log('Pool info:', JSON.stringify(poolInfo, null, 2));
  });

  it('should fetch token info', async () => {
    const tokenInfo = await api.fetchTokenInfo("So11111111111111111111111111111111111111112");
    expect(tokenInfo).not.toBeInstanceOf(Error);
    console.log('Token info:', JSON.stringify(tokenInfo, null, 2));
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
