export type SailfishTierFree = { type: "free" };
export type SailfishTierBasic = { type: "basic", apiKey: string };
export type SailfishTierLegacy = { type: "legacy", baseUrl?: string };

export type SailfishTier =
  | SailfishTierFree
  | SailfishTierBasic
  | SailfishTierLegacy
  ;

export type AuthHeaders = Record<string, string>;

export const SailfishTier = {
  is(value: unknown): value is SailfishTier {
    return false
      || SailfishTier.isFree(value)
      || SailfishTier.isBasic(value)
      || SailfishTier.isLegacy(value)
      ;
  },
  free(): SailfishTierFree {
    return { type: "free" };
  },
  isFree(value: unknown): value is SailfishTierFree {
    return _hasType(value) && value.type === "free";
  },
  basic({ apiKey }: { apiKey: string }): SailfishTierBasic {
    return { type: "basic", apiKey };
  },
  isBasic(value: unknown): value is SailfishTierBasic {
    return _hasType(value) && value.type === "basic" && _hasApiKey(value);
  },
  legacy({ baseUrl }: { baseUrl?: string } = {}): SailfishTierLegacy {
    return { type: "legacy", baseUrl };
  },
  isLegacy(value: unknown): value is SailfishTierLegacy {
    return _hasType(value) && value.type === "legacy" && _hasPropStringOrUndefined(value, "baseUrl");
  },
  wsBaseUrl(tier: SailfishTier): { baseUrl: string, authHeaders: AuthHeaders } {
    let { baseUrl, authHeaders } = SailfishTier.httpBaseUrl(tier);

    baseUrl = baseUrl
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    return { baseUrl, authHeaders };
  },
  httpBaseUrl(tier: SailfishTier): { baseUrl: string, authHeaders: AuthHeaders } {
    if (SailfishTier.isFree(tier)) {
      return {
        baseUrl: "https://free.sailfish.solanavibestation.com",
        authHeaders: {},
      };
    }

    if (SailfishTier.isBasic(tier)) {
      return {
        baseUrl: "https://basic.sailfish.solanavibestation.com",
        authHeaders: { "Authorization": tier.apiKey },
      };
    }

    if (SailfishTier.isLegacy(tier)) {
      return {
        baseUrl: tier.baseUrl ?? "https://sailfish.0xfire.com",
        authHeaders: {},
      }
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
