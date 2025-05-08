# WebSocket Integration for StageConnect

This directory contains the WebSocket service for real-time messaging in StageConnect.

## Overview

The WebSocket service connects to the Spring Boot backend using SockJS and STOMP protocol, enabling:

- Real-time messaging between users
- Message read receipts
- Typing indicators
- Online status tracking

## Usage

### Basic Connection

```typescript
import WebSocketService from '@/services/WebSocketService';

// Connect to WebSocket server
const userId = 123; // Current user's ID
const token = localStorage.getItem('token');
await WebSocketService.connect(userId, token);

// Disconnect when done
WebSocketService.disconnect();
```

### Sending Messages

```typescript
// Send a chat message
WebSocketService.sendMessage('/app/chat.sendMessage', {
  type: 'CHAT',
  senderId: 123,
  receiverId: 456,
  content: 'Hello!',
  conversationId: '123_456',
  timestamp: new Date()
});

// Send typing indicator
WebSocketService.sendMessage('/app/chat.typing', {
  type: 'TYPING',
  senderId: 123,
  receiverId: 456
});

// Send read receipt
WebSocketService.sendMessage('/app/chat.read', {
  type: 'READ',
  senderId: 123,
  receiverId: 456,
  conversationId: '123_456'
});
```

### Receiving Messages

Register message handlers to process incoming messages:

```typescript
// Register a message handler
WebSocketService.registerMessageHandler('myComponent', (message) => {
  if (message.type === 'CHAT') {
    console.log('New message:', message.content);
  }
});

// Unregister when component unmounts
WebSocketService.unregisterMessageHandler('myComponent');
```

## Troubleshooting

If you encounter WebSocket connection issues:

1. Ensure the backend is running and the WebSocket endpoint is accessible
2. Check network connectivity and CORS settings
3. Verify your authentication token is valid
4. Use the WebSocketStatus component for visual debugging
5. Check browser console for detailed error messages

## WebSocketStatus Component

For easier debugging, use the WebSocketStatus component:

```tsx
import WebSocketStatus from '@/components/messaging/WebSocketStatus';

// Add to your component
<WebSocketStatus />
```

This displays the connection status and provides controls for testing the connection. 