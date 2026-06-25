import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false, // We'll connect explicitly in Layout
});

