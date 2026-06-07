import { useEffect, useRef, JSX } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const socket = io('http://localhost:3001', {
      query: { userId: user.id },
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
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, queryClient]);

  return socketRef;
}

export function SocketInit(): JSX.Element | null {
  useSocket();
  return null;
}
