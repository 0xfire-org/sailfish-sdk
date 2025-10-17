"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BONDING_CURVE_POOL_TYPES: () => BONDING_CURVE_POOL_TYPES,
  DEFAULT_QUOTE_TOKEN_ADDRESSES: () => DEFAULT_QUOTE_TOKEN_ADDRESSES,
  PRODUCTION_API_URL: () => PRODUCTION_API_URL,
  PRODUCTION_WS_URL: () => PRODUCTION_WS_URL,
  PoolType: () => PoolType,
  Sailfish: () => Sailfish,
  SailfishApi: () => SailfishApi,
  SailfishEventResource: () => SailfishEventResource,
  SailfishEventType: () => SailfishEventType,
  SailfishWebsocket: () => SailfishWebsocket,
  amountToFloatString: () => amountToFloatString,
  getQuoteAndBaseTokenInfos: () => getQuoteAndBaseTokenInfos,
  getTradeData: () => getTradeData
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var SailfishEventType = /* @__PURE__ */ ((SailfishEventType2) => {
  SailfishEventType2["Event"] = "event";
  SailfishEventType2["Signal"] = "signal";
  return SailfishEventType2;
})(SailfishEventType || {});
var SailfishEventResource = /* @__PURE__ */ ((SailfishEventResource2) => {
  SailfishEventResource2["TokenInits"] = "token-inits";
  SailfishEventResource2["TokenMints"] = "token-mints";
  SailfishEventResource2["TokenGraduates"] = "token-graduates";
  SailfishEventResource2["PoolInits"] = "pool-inits";
  SailfishEventResource2["PoolGraduates"] = "pool-graduates";
  SailfishEventResource2["TradesRaw"] = "trades-raw";
  return SailfishEventResource2;
})(SailfishEventResource || {});
var PoolType = /* @__PURE__ */ ((PoolType2) => {
  PoolType2["UniswapV2"] = "UniswapV2";
  PoolType2["UniswapV3"] = "UniswapV3";
  PoolType2["RaydiumAmm"] = "RaydiumAmm";
  PoolType2["RaydiumCpmm"] = "RaydiumCpmm";
  PoolType2["RaydiumClmm"] = "RaydiumClmm";
  PoolType2["RadiumLaunchpad"] = "RadiumLaunchpad";
  PoolType2["PumpSwapAmm"] = "PumpSwapAmm";
  PoolType2["PumpFunAmm"] = "PumpFunAmm";
  PoolType2["MeteoraDyn"] = "MeteoraDyn";
  PoolType2["MeteoraDynV2"] = "MeteoraDynV2";
  PoolType2["AerodromeV2"] = "AerodromeV2";
  PoolType2["AerodromeV3"] = "AerodromeV3";
  return PoolType2;
})(PoolType || {});

// src/api.ts
var import_axios = __toESM(require("axios"));

// src/constants.ts
var PRODUCTION_API_URL = "https://sailfish.0xfire.com";
var PRODUCTION_WS_URL = "wss://sailfish.0xfire.com/stream/public/ws";

// src/api.ts
var HEADERS = { headers: { "Content-Type": "application/json" } };
var SailfishApi = class {
  constructor(baseUrl = PRODUCTION_API_URL) {
    this.baseUrl = baseUrl;
  }
  async fetchPoolInfo(address) {
    const url = `${this.baseUrl}/pools/info`;
    const response = await import_axios.default.post(url, address, HEADERS);
    if (response.status !== 200) {
      return new Error(`Failed to fetch pool info: ${response.statusText}`);
    }
    return response.data;
  }
  async fetchTokenInfo(address) {
    const url = `${this.baseUrl}/tokens/info`;
    const response = await import_axios.default.post(url, address, HEADERS);
    if (response.status !== 200) {
      return new Error(`Failed to fetch token info: ${response.statusText}`);
    }
    return response.data;
  }
};

// src/websocket.ts
var import_isomorphic_ws = __toESM(require("isomorphic-ws"));
var SailfishWebsocket = class {
  constructor(ws_url, botName, filter, callback) {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.reconnecting = false;
    this.maxReconnects = 50;
    this.reconnectDelay = 1e3;
    this.enabled = true;
    this.connecting = false;
    this.connected = false;
    this.botName = botName;
    this.ws_url = ws_url;
    this.filter = filter;
    this.callback = callback;
    this._start();
  }
  updateFilter(newFilter) {
    this.filter = newFilter;
    this.send({ type: "updateFilter", filter: newFilter });
  }
  _start() {
    if (!this.enabled || this.reconnecting) return;
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.warn(`Max reconnect attempts reached for ${this.botName}`);
      return;
    }
    this.reconnectAttempts++;
    this.connecting = true;
    console.log(`Connecting to ${this.ws_url} for ${this.botName}, attempt ${this.reconnectAttempts}`);
    this.socket = new import_isomorphic_ws.default(this.ws_url);
    this.socket.addEventListener("open", this.onOpen.bind(this));
    this.socket.addEventListener("message", this.onMessage.bind(this));
    this.socket.addEventListener("close", this.onClose.bind(this));
    this.socket.addEventListener("error", this.onError.bind(this));
  }
  onOpen() {
    var _a;
    console.log(`Connected to ${this.ws_url} for ${this.botName}`);
    this.connected = true;
    this.connecting = false;
    this.reconnecting = false;
    this.reconnectAttempts = 0;
    (_a = this.socket) == null ? void 0 : _a.send("Hello Server!");
    this.updateFilter(this.filter);
  }
  onMessage(event) {
    try {
      const data = JSON.parse(event.data);
      this.callback(data);
    } catch (err) {
      console.error(`Failed to parse message for ${this.botName}`, err);
    }
  }
  onClose(event) {
    console.warn(`Socket closed for ${this.botName}`, event);
    this.connected = false;
    this.connecting = false;
    this.scheduleReconnect();
  }
  onError(event) {
    var _a;
    console.error(`WebSocket error for ${this.botName}`, event);
    (_a = this.socket) == null ? void 0 : _a.close();
  }
  scheduleReconnect() {
    if (!this.enabled || this.reconnecting) return;
    this.reconnecting = true;
    setTimeout(() => {
      this.reconnecting = false;
      this._start();
    }, this.reconnectDelay);
  }
  stop() {
    var _a;
    this.enabled = false;
    this.connected = false;
    this.connecting = false;
    (_a = this.socket) == null ? void 0 : _a.close();
    this.socket = null;
  }
  send(data) {
    if (!this.socket || this.socket.readyState !== import_isomorphic_ws.default.OPEN) {
      console.warn(`Cannot send message; socket not open for ${this.botName}`);
      return;
    }
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    this.socket.send(payload);
  }
};

// src/sailfish.ts
var DEFAULT_QUOTE_TOKEN_ADDRESSES = [
  "11111111111111111111111111111111",
  // SOL
  "So11111111111111111111111111111111111111112",
  // WSOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  // USDC
  "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB"
  // USD1
];
var BONDING_CURVE_POOL_TYPES = [
  "PumpFunAmm" /* PumpFunAmm */,
  "RadiumLaunchpad" /* RadiumLaunchpad */
];
function amountToFloatString(amount, decimals) {
  if (amount === null || amount === void 0) {
    console.error("amountToFloatString received undefined/null amount");
    return "0";
  }
  const amountStr = String(amount);
  const padded = amountStr.padStart(decimals + 1, "0");
  const integerPart = padded.slice(0, padded.length - decimals) || "0";
  const fractionalPart = padded.slice(padded.length - decimals);
  return `${integerPart}.${fractionalPart}`;
}
function getTradeData(poolInfo, tradeRaw) {
  let quoteAmount = "0";
  let baseAmount = "0";
  let price = "0";
  if (poolInfo.quote_token.address.toLowerCase() === tradeRaw.token_address_in.toLowerCase()) {
    quoteAmount = `-${amountToFloatString(tradeRaw.token_amount_in, poolInfo.quote_token.decimals)}`;
    baseAmount = amountToFloatString(tradeRaw.token_amount_out, poolInfo.base_token.decimals);
  } else {
    quoteAmount = amountToFloatString(tradeRaw.token_amount_out, poolInfo.quote_token.decimals);
    baseAmount = `-${amountToFloatString(tradeRaw.token_amount_in, poolInfo.base_token.decimals)}`;
  }
  price = (Math.abs(parseFloat(quoteAmount)) / Math.abs(parseFloat(baseAmount))).toString();
  return {
    quote_amount: quoteAmount,
    base_amount: baseAmount,
    price
  };
}
function getQuoteAndBaseTokenInfos(token0Info, token1Info, supportedQuoteTokens = DEFAULT_QUOTE_TOKEN_ADDRESSES) {
  if (supportedQuoteTokens.includes(token0Info.address)) {
    return { quoteTokenInfo: token0Info, baseTokenInfo: token1Info };
  }
  if (supportedQuoteTokens.includes(token1Info.address)) {
    return { quoteTokenInfo: token1Info, baseTokenInfo: token0Info };
  }
  throw new Error(`No supported quote token found for ${token0Info.address} and ${token1Info.address}`);
}
var Sailfish = class {
  constructor(callbacks, filter, apiUrl = PRODUCTION_API_URL, wsUrl = PRODUCTION_WS_URL) {
    this.ws = null;
    this.api = new SailfishApi(apiUrl);
    this.callbacks = callbacks;
    this.filter = filter;
    this.wsUrl = wsUrl;
    this.poolInfos = {};
    this.tokenInfos = {};
  }
  isRunning() {
    return this.ws !== null && this.ws.connected;
  }
  swim() {
    if (this.ws !== null) {
      return;
    }
    this.ws = new SailfishWebsocket(
      this.wsUrl,
      "sailfish-ws",
      this.filter,
      (message) => {
        this.onMessage(message);
      }
    );
  }
  rest() {
    if (this.ws === null) {
      return;
    }
    this.ws.stop();
    this.ws = null;
  }
  onMessage(message) {
    switch (message.resource) {
      case "token-inits" /* TokenInits */:
        for (const tokenInit of message.data) {
          this.callbacks.onTokenInit(tokenInit);
        }
        break;
      case "token-mints" /* TokenMints */:
        for (const tokenMint of message.data) {
          this.callbacks.onTokenMint(tokenMint);
        }
        break;
      case "token-graduates" /* TokenGraduates */:
        for (const poolInit of message.data) {
          this.callbacks.onTokenGraduate(poolInit);
        }
        break;
      case "pool-inits" /* PoolInits */:
        for (const poolInit of message.data) {
          this.callbacks.onPoolInit(poolInit);
        }
        break;
      case "trades-raw" /* TradesRaw */:
        const tradesRaw = message.data;
        for (const tradeRaw of tradesRaw) {
          this.callbacks.onTradeRaw(tradeRaw);
          const trade = this.convertTradeRawToTrade(tradeRaw);
          if (trade !== null) {
            this.callbacks.onTrade(trade);
          }
        }
        break;
      default:
        this.callbacks.onMessage(message);
        break;
    }
  }
  convertTradeRawToTrade(tradeRaw) {
    const poolInfo = this.getPoolInfo(tradeRaw.pool_address);
    if (poolInfo === null) {
      return null;
    }
    const tradeData = getTradeData(poolInfo, tradeRaw);
    const trade = {
      index: tradeRaw.index,
      pool_address: tradeRaw.pool_address,
      quote_token_address: poolInfo.quote_token.address,
      base_token_address: poolInfo.base_token.address,
      quote_amount: tradeData.quote_amount,
      base_amount: tradeData.base_amount,
      price: tradeData.price,
      fee: tradeRaw.fee,
      bribe: tradeRaw.bribe,
      from_wallet: tradeRaw.from_wallet,
      to_wallet: tradeRaw.to_wallet,
      from_wallet_account: tradeRaw.from_account,
      to_wallet_account: tradeRaw.to_account
    };
    return trade;
  }
  updateFilter(filter) {
    this.filter = filter;
    if (this.ws !== null) {
      this.ws.updateFilter(filter);
    }
  }
  hasCachedPoolInfo(poolAddress) {
    return this.poolInfos[poolAddress] !== void 0;
  }
  hasCachedTokenInfo(tokenAddress) {
    return this.tokenInfos[tokenAddress] !== void 0;
  }
  async fetchPoolInfo(poolAddress) {
    if (this.hasCachedPoolInfo(poolAddress)) {
      return this.poolInfos[poolAddress];
    }
    try {
      const newPoolInfo = await this.api.fetchPoolInfo(poolAddress);
      if (newPoolInfo instanceof Error) {
        return newPoolInfo;
      }
      this.poolInfos[poolAddress] = newPoolInfo;
      return newPoolInfo;
    } catch (error) {
      return new Error(`Failed to fetch pool info: ${error}, use buildPoolInfo instead for ${BONDING_CURVE_POOL_TYPES.join(", ")} pools`);
    }
  }
  async fetchTokenInfo(tokenAddress) {
    if (this.hasCachedTokenInfo(tokenAddress)) {
      return this.tokenInfos[tokenAddress];
    }
    try {
      const newTokenInfo = await this.api.fetchTokenInfo(tokenAddress);
      if (newTokenInfo instanceof Error) {
        return newTokenInfo;
      }
      this.tokenInfos[tokenAddress] = newTokenInfo;
      return newTokenInfo;
    } catch (error) {
      return new Error(`Failed to fetch token info: ${error}`);
    }
  }
  insertPoolInfo(poolInfo) {
    this.poolInfos[poolInfo.address] = poolInfo;
  }
  async buildPoolInfoFromPoolInit(poolInit, supportedQuoteTokens = DEFAULT_QUOTE_TOKEN_ADDRESSES) {
    if (this.hasCachedPoolInfo(poolInit.pool_address)) {
      return this.poolInfos[poolInit.pool_address];
    }
    const token0Info = await this.fetchTokenInfo(poolInit.token_0_mint);
    const token1Info = await this.fetchTokenInfo(poolInit.token_1_mint);
    if (token0Info instanceof Error || token1Info instanceof Error) {
      return new Error(`Failed to build pool info from pool init: ${token0Info} or ${token1Info}`);
    }
    const { quoteTokenInfo, baseTokenInfo } = getQuoteAndBaseTokenInfos(token0Info, token1Info, supportedQuoteTokens);
    const poolInfo = await this.buildPoolInfo(poolInit.pool_type, poolInit.pool_address, quoteTokenInfo, baseTokenInfo);
    if (poolInfo instanceof Error) {
      return new Error(`Failed to build pool info from pool init: ${poolInfo}`);
    }
    return poolInfo;
  }
  async buildPoolInfo(poolType, poolAddress, quoteTokenInfo, baseTokenInfo) {
    const poolInfo = {
      pool_type: poolType,
      address: poolAddress,
      quote_token: quoteTokenInfo,
      base_token: baseTokenInfo,
      buy_path: [
        quoteTokenInfo.address,
        baseTokenInfo.address
      ],
      sell_path: [
        baseTokenInfo.address,
        quoteTokenInfo.address
      ]
    };
    return poolInfo;
  }
  getPoolInfo(poolAddress) {
    var _a;
    return (_a = this.poolInfos[poolAddress]) != null ? _a : null;
  }
  getTokenInfo(tokenAddress) {
    var _a;
    return (_a = this.tokenInfos[tokenAddress]) != null ? _a : null;
  }
  getAllPools() {
    return this.poolInfos;
  }
  getAllTokens() {
    return this.tokenInfos;
  }
  getFilter() {
    return this.filter;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BONDING_CURVE_POOL_TYPES,
  DEFAULT_QUOTE_TOKEN_ADDRESSES,
  PRODUCTION_API_URL,
  PRODUCTION_WS_URL,
  PoolType,
  Sailfish,
  SailfishApi,
  SailfishEventResource,
  SailfishEventType,
  SailfishWebsocket,
  amountToFloatString,
  getQuoteAndBaseTokenInfos,
  getTradeData
});
//# sourceMappingURL=index.js.map