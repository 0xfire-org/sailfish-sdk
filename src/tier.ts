export type SailfishTierDemo = { type: "demo", apiKey: string };
export type SailfishTierFree = { type: "free", apiKey: string };
export type SailfishTierBasic = { type: "basic", apiKey: string };
export type PolymarketTier = { type: "polymarket", apiKey: string };

export type SailfishTier =
  | SailfishTierDemo
  | SailfishTierFree
  | SailfishTierBasic
  | PolymarketTier
  ;

export type SailfishTierType = SailfishTier['type'];

export type AuthHeaders = Record<string, string>;

export const SailfishTier = {
  is(value: unknown): value is SailfishTier {
    return false
      || SailfishTier.isFree(value)
      || SailfishTier.isBasic(value)
      ;
  },

  demo({ apiKey }: { apiKey: string }): SailfishTierDemo {
    return { type: "demo", apiKey: "demo" };
  },
  free({ apiKey }: { apiKey: string }): SailfishTierFree {
    return { type: "free", apiKey };
  },
  basic({ apiKey }: { apiKey: string }): SailfishTierBasic {
    return { type: "basic", apiKey };
  },
  isDemo(value: unknown): value is SailfishTierDemo {
    return _hasType(value) && value.type === "demo" && _hasApiKey(value);
  },
  isFree(value: unknown): value is SailfishTierFree {
    return _hasType(value) && value.type === "free" && _hasApiKey(value);
  },
  isBasic(value: unknown): value is SailfishTierBasic {
    return _hasType(value) && value.type === "basic" && _hasApiKey(value);
  },
  isPolymarket(value: unknown): value is PolymarketTier {
    return _hasType(value) && value.type === "polymarket" && _hasApiKey(value);
  },
  wsBaseUrl(tier: SailfishTier): { baseUrl: string, authHeaders: AuthHeaders } {
    let { baseUrl, authHeaders } = SailfishTier.httpBaseUrl(tier);
    if (SailfishTier.isDemo(tier)) {
      baseUrl = "wss://sailfish.0xfire.com/stream";
    }

    baseUrl = baseUrl
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    return { baseUrl, authHeaders };
  },
  httpBaseUrl(tier: SailfishTier): { baseUrl: string, authHeaders: AuthHeaders } {
    if (SailfishTier.isDemo(tier)) {
      return {
        baseUrl: "https://sailfish.0xfire.com",
        authHeaders: { "Authorization": tier.apiKey },
      };
    }

    if (SailfishTier.isFree(tier)) {
      return {
        baseUrl: "https://free.sailfish.solanavibestation.com",
        authHeaders: { "Authorization": tier.apiKey },
      };
    }

    if (SailfishTier.isBasic(tier)) {
      return {
        baseUrl: "https://basic.sailfish.solanavibestation.com",
        authHeaders: { "Authorization": tier.apiKey },
      };
    }

    if (SailfishTier.isPolymarket(tier)) {
      return {
        baseUrl: "https://polymarket-sailfish.0xfire.com",
        authHeaders: { "Authorization": tier.apiKey },
      };
    }

    const _exhaustiveCheck: never = tier;
    throw new Error(`Unsupported tier: ${JSON.stringify(tier)}`);
  },
};

function _hasType(value: unknown): value is { type: string } {
  return _hasPropString(value, "type");
}

function _hasApiKey(value: unknown): value is { apiKey: string } {
  return _hasPropString(value, "apiKey");
}

function _hasPropString(value: unknown, prop: string): value is { [prop]: string } {
  return _hasPropStringOrUndefined(value, prop) && (typeof value[prop] !== "undefined")
}

function _hasPropStringOrUndefined(value: unknown, prop: string): value is { [prop]: string } {
  if (typeof value !== "object") return false;
  if (value === null) return false;
  if (!(prop in value)) return false;

  const propValue = (value as any)[prop];
  if (typeof propValue === "undefined") {
    // no-op
  } else if (typeof propValue === "string") {
    // no-op
  } else {
    return false;
  };

  return true;
}
