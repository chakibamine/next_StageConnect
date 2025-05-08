declare module 'sockjs-client' {
  interface SockJSOptions {
    server?: string;
    transports?: string | string[];
    sessionId?: number | (() => number);
    heartbeat?: number;
    timeout?: number;
    protocols_whitelist?: string[];
    info?: any;
  }

  class SockJS {
    constructor(url: string, _reserved?: any, options?: SockJSOptions);
    close(code?: number, reason?: string): void;
    send(data: string): void;
    onopen: (e: Event) => void;
    onclose: (e: CloseEvent) => void;
    onmessage: (e: MessageEvent) => void;
    onerror: (e: Event) => void;
  }

  export default SockJS;
} 