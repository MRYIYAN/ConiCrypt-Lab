import { logger } from './logger';

export type MessageHandler = (data: any) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      logger.debug('WebSocket already connected');
      return;
    }

    try {
      logger.info(`Connecting to WebSocket: ${this.url}`);
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        logger.info('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnectionListeners(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          logger.debug(`Received message: ${JSON.stringify(data)}`);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          logger.error(`Failed to parse message: ${error}`);
        }
      };

      this.ws.onerror = (error) => {
        logger.error(`WebSocket error: ${error}`);
      };

      this.ws.onclose = () => {
        logger.warn('WebSocket closed');
        this.notifyConnectionListeners(false);
        this.attemptReconnect();
      };
    } catch (error) {
      logger.error(`Failed to create WebSocket: ${error}`);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.info(`Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      logger.error('Max reconnection attempts reached');
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(data);
      logger.debug(`Sending message: ${message}`);
      this.ws.send(message);
    } else {
      logger.error('WebSocket is not connected');
      throw new Error('WebSocket is not connected');
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnectionChange(listener: (connected: boolean) => void) {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:9090/ws';
export const wsClient = new WebSocketClient(WS_URL);
