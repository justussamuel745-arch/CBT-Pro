import { io } from "socket.io-client";
import { url } from '../scripts/utilis/url.js'

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(url, {
      transports: ["websocket"],
      auth: {
        token,
      },
      withCredentials: true,
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }

  emit(event, data) {
    this.socket?.emit(event, data);
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();