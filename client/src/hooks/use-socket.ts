import { useEffect, useRef, JSX } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';

export function useSocket() {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('notification', (notification: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: notification.title,
        description: notification.message,
      });
    });

    return () => {
      socket.removeAllListeners();
      if (socket.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [token, queryClient]);

  return socketRef;
}

export function SocketInit(): JSX.Element | null {
  useSocket();
  return null;
}
