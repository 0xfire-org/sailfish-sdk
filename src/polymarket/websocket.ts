import WebSocket from "isomorphic-ws";
import type { SailfishConfig, AuthHeaders } from "../types.js";
import { resolveConfig } from "../types.js";
import type { OrderbookUpdateMessage } from "./types.js";

export type PolymarketWebsocketConfig = SailfishConfig & {
  botName?: string;
  onOrderbookUpdate?: (update: OrderbookUpdateMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

export class PolymarketWebsocket {
  public readonly botName: string;
  public enabled: boolean = true;
  public connecting: boolean = false;
  public connected: boolean = false;

  private readonly baseUrl: string;
  private readonly authHeaders: AuthHeaders;

  private onOrderbookUpdateCb?: (update: OrderbookUpdateMessage) => void;
  private onConnectCb?: () => void;
  private onDisconnectCb?: () => void;

  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private reconnecting: boolean = false;
  private readonly maxReconnects = 50;
  private readonly reconnectDelay = 1000;

  private subscriptions: Set<string> = new Set();

  constructor(config: PolymarketWebsocketConfig) {
    const resolved = resolveConfig(config);
    this.baseUrl = resolved.wsBaseUrl;
    this.authHeaders = resolved.authHeaders;
    this.botName = config.botName ?? "polymarket-sub-ws";
    this.onOrderbookUpdateCb = config.onOrderbookUpdate;
    this.onConnectCb = config.onConnect;
    this.onDisconnectCb = config.onDisconnect;
    this._start();
  }

  public subscribe(conditionId: string): void {
    this.subscriptions.add(conditionId);
    this.send({ action: "subscribe", condition_id: conditionId });
  }

  public unsubscribe(conditionId: string): void {
    this.subscriptions.delete(conditionId);
    this.send({ action: "unsubscribe", condition_id: conditionId });
  }

  public getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  private _start() {
    if (!this.enabled || this.reconnecting) return;

    if (this.reconnectAttempts >= this.maxReconnects) {
      console.warn(`Max reconnect attempts reached for ${this.botName}`);
      return;
    }

    this.reconnectAttempts++;
    this.connecting = true;
    console.log(`Connecting to ${this.baseUrl} for ${this.botName}, attempt ${this.reconnectAttempts}`);

    const path = "/api/ws/orderbooks";
    const isBrowser = typeof window !== "undefined";
    if (isBrowser) {
      const params = new URLSearchParams(this.authHeaders as any).toString();
      this.socket = new WebSocket(`${this.baseUrl}${path}?${params}`);
      console.warn("You are running this in a browser. You cannot auth via a browser because of websocket limitations. Please use Sailfish as a backend service.");
    } else {
      this.socket = new WebSocket(this.baseUrl + path, {
        headers: { ...this.authHeaders },
      } as any);
    }

    this.socket.addEventListener("open", this.onOpen.bind(this));
    this.socket.addEventListener("message", this.onMessage.bind(this));
    this.socket.addEventListener("close", this.onClose.bind(this));
    this.socket.addEventListener("error", this.onError.bind(this));
  }

  private onOpen() {
    console.log(`Connected to ${this.baseUrl} for ${this.botName}`);
    this.connected = true;
    this.connecting = false;
    this.reconnecting = false;
    this.reconnectAttempts = 0;
    this.onConnectCb?.();
    // Re-subscribe to all tracked condition_ids after reconnect
    for (const conditionId of this.subscriptions) {
      this.send({ action: "subscribe", condition_id: conditionId });
    }
  }

  private onMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "orderbook_update") {
        this.onOrderbookUpdateCb?.(data as OrderbookUpdateMessage);
      }
    } catch (err) {
      console.error(`Failed to parse message for ${this.botName}`, err);
    }
  }

  private onClose(event: CloseEvent) {
    console.warn(`Socket closed for ${this.botName}`, event);
    this.connected = false;
    this.connecting = false;
    this.onDisconnectCb?.();
    this.scheduleReconnect();
  }

  private onError(event: Event) {
    console.error(`WebSocket error for ${this.botName}`, event);
    this.socket?.close();
  }

  private scheduleReconnect() {
    if (!this.enabled || this.reconnecting) return;

    this.reconnecting = true;
    setTimeout(() => {
      this.reconnecting = false;
      this._start();
    }, this.reconnectDelay);
  }

  public stop() {
    this.enabled = false;
    this.connected = false;
    this.connecting = false;
    this.socket?.close();
    this.socket = null;
  }

  private send(data: string | object) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = typeof data === "string" ? data : JSON.stringify(data);
    this.socket.send(payload);
  }
}
