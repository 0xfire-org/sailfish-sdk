import type { Filter, SailfishMessage } from "./types";
import WebSocket from "isomorphic-ws";

export class SailfishWebsocket {
  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private reconnecting: boolean = false;
  private readonly maxReconnects = 50;
  private readonly reconnectDelay = 1000;

  public readonly botName: string;
  public readonly ws_url: string;
  public enabled: boolean = true;
  public connecting: boolean = false;
  public connected: boolean = false;

  private callback: (message: SailfishMessage) => void;

  private filter: Filter;

  constructor(
    ws_url: string,
    botName: string,
    filter: Filter,
    callback: (message: SailfishMessage) => void,
  ) {
    this.botName = botName;
    this.ws_url = ws_url;
    this.filter = filter;
    this.callback = callback;
    this._start();
  }

  public updateFilter(newFilter: Filter) {
    this.filter = newFilter;
    this.send({ type: "updateFilter", filter: newFilter });
  }

  private _start() {
    if (!this.enabled || this.reconnecting) return;

    if (this.reconnectAttempts >= this.maxReconnects) {
      console.warn(`Max reconnect attempts reached for ${this.botName}`);
      return;
    }

    this.reconnectAttempts++;
    this.connecting = true;
    console.log(`Connecting to ${this.ws_url} for ${this.botName}, attempt ${this.reconnectAttempts}`);

    this.socket = new WebSocket(this.ws_url);
    this.socket.addEventListener("open", this.onOpen.bind(this));
    this.socket.addEventListener("message", this.onMessage.bind(this));
    this.socket.addEventListener("close", this.onClose.bind(this));
    this.socket.addEventListener("error", this.onError.bind(this));
  }

  private onOpen() {
    console.log(`Connected to ${this.ws_url} for ${this.botName}`);
    this.connected = true;
    this.connecting = false;
    this.reconnecting = false;
    this.reconnectAttempts = 0;
    this.socket?.send("Hello Server!");
    this.updateFilter(this.filter); // bootstrap filter
  }

  private onMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      this.callback(data);
    } catch (err) {
      console.error(`Failed to parse message for ${this.botName}`, err);
    }
  }

  private onClose(event: CloseEvent) {
    console.warn(`Socket closed for ${this.botName}`, event);
    this.connected = false;
    this.connecting = false;
    this.scheduleReconnect();
  }

  private onError(event: Event) {
    console.error(`WebSocket error for ${this.botName}`, event);
    this.socket?.close(); // Trigger reconnect
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

  public send(data: string | object) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn(`Cannot send message; socket not open for ${this.botName}`);
      return;
    }

    const payload = typeof data === "string" ? data : JSON.stringify(data);
    this.socket.send(payload);
  }
}
