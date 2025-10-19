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
      from_block: latestBlock as number - 1_000,
      to_block: latestBlock as number,
      pool_addresses: ["3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv"], // USDC/SOL pool
    };
    const trades_result = await api.fetchTrades(tradesQuery);
    expect(trades_result).not.toBeInstanceOf(Error);
    console.log('Fetch trades:', trades_result["3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv"]?.length);
  });

  it('should return an error for invalid block range', async () => {
    let tradesQuery: TradesQuery = {
      from_block: 0,
      to_block: 1000000000,
      pool_addresses: [],
    };
    const trades = await api.fetchTrades(tradesQuery);
    expect(trades).toBeInstanceOf(Error);
    console.log('Error:', trades?.message);

    tradesQuery.from_block = 1000000000;
    tradesQuery.to_block = 999999999;
    const trades2 = await api.fetchTrades(tradesQuery);
    expect(trades2).toBeInstanceOf(Error);
    console.log('Error:', trades2?.message);


    tradesQuery.from_block = -1;
    tradesQuery.to_block = 1000000001;
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
      from_block: graduated_block - 99_990,
      to_block: graduated_block + 1,
      pool_types: [PoolType.PumpFunAmm, PoolType.RaydiumLaunchpad],
      pool_addresses: [],
    };
    const graduatedPools = await api.fetchRawGraduations(graduatedPoolsQuery);
    if (graduatedPools instanceof Error) {
      console.error('Fetch graduated pools Error:', graduatedPools.message);
    }
    expect(graduatedPools).not.toBeInstanceOf(Error);
    console.log(`Raw graduations - pump: ${graduatedPools?.pumpswap_graduations.length}, raydium_amm: ${graduatedPools?.raydium_amm_graduations.length}, raydium_cpmm: ${graduatedPools?.raydium_cpmm_graduations.length}`);
  }, 5 * 60 * 1000); // 5 minutes timeout
});
