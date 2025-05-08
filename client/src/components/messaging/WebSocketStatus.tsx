import { useState, useEffect } from 'react';
import WebSocketService, { WebSocketEventType } from '@/services/WebSocketService';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

interface WebSocketStatusProps {
  minimal?: boolean;
}

const WebSocketStatus = ({ minimal = false }: WebSocketStatusProps) => {
  const [connected, setConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Check initial connection status
    setConnected(WebSocketService.isConnected());
    
    // Setup event listeners
    const connectedHandler = () => {
      setConnected(true);
      setHasError(false);
      setErrorMessage(null);
    };
    
    const disconnectedHandler = () => {
      setConnected(false);
    };
    
    const errorHandler = (error: any) => {
      setHasError(true);
      setErrorMessage(error?.message || "Connection error");
    };
    
    // Register event handlers
    const removeConnected = WebSocketService.addEventListener(WebSocketEventType.CONNECTED, connectedHandler);
    const removeDisconnected = WebSocketService.addEventListener(WebSocketEventType.DISCONNECTED, disconnectedHandler);
    const removeError = WebSocketService.addEventListener(WebSocketEventType.ERROR, errorHandler);
    
    return () => {
      // Clean up event listeners
      removeConnected();
      removeDisconnected();
      removeError();
    };
  }, []);
  
  const handleConnect = async () => {
    try {
      if (!user?.id) {
        setErrorMessage("Cannot connect: No user ID");
        return;
      }
      
      setHasError(false);
      setErrorMessage(null);
      await WebSocketService.connect(Number(user.id), localStorage.getItem('token') || '');
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setHasError(true);
      setErrorMessage((error as Error)?.message || "Connection failed");
    }
  };
  
  if (minimal) {
    return (
      <div 
        className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : hasError ? 'bg-red-500' : 'bg-yellow-500'}`}
        title={errorMessage || (connected ? 'Connected' : 'Disconnected')}
      />
    );
  }
  
  return (
    <div className="fixed top-1 right-1 z-50 opacity-50 hover:opacity-100 transition-opacity">
      <div className="flex items-center bg-white/80 dark:bg-gray-800/80 rounded-full px-2 py-1 shadow-sm text-xs">
        <div 
          className={`w-2 h-2 rounded-full mr-1.5 ${
            connected ? 'bg-green-500' : 
            hasError ? 'bg-red-500' : 'bg-yellow-500'
          }`}
        />
        <span>{
          connected ? 'Connected' : 
          hasError ? 'Error' : 'Connecting...'
        }</span>
        
        {hasError && (
          <div className="relative group ml-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs p-1 rounded whitespace-nowrap">
              {errorMessage || "Connection error"}
            </div>
          </div>
        )}
        
        {!connected && (
          <Button 
            onClick={handleConnect}
            variant="ghost"
            size="sm"
            className="h-6 ml-1 text-xs"
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
};

export default WebSocketStatus; 