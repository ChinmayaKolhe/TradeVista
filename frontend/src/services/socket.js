import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};

export const subscribeToStock = (symbol, callback) => {
  const s = getSocket();
  s.emit('subscribe_stock', symbol);
  s.on('price_update', (data) => {
    if (data.symbol === symbol) callback(data);
  });
};

export const unsubscribeFromStock = (symbol) => {
  const s = getSocket();
  s.emit('unsubscribe_stock', symbol);
  s.off('price_update');
};
