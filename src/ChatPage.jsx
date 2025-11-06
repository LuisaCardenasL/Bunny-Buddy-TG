import { useState, useRef, useEffect } from 'react';
import websocketService from './services/websocketService';
import './ChatPage.css';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection according to architecture
    const initializeConnection = async () => {
      try {
        // Use the actual API Gateway WebSocket URL
        const wsUrl = import.meta.env.VITE_WS_URL || 'wss://ju9vt4ured.execute-api.us-east-1.amazonaws.com/prod/';
        await websocketService.connect(wsUrl);
        
        // Set up message handler for responses from Bedrock via Lambda
        websocketService.onMessage((data) => {
          console.log('📨 Received data:', data);
          
          if (data.type === 'chunk' && data.text) {
            console.log('🔄 Processing chunk:', data.text);
            
            // Limpiar etiquetas de acción y texto interno del bot
            let cleanText = data.text
              .replace(/<action>.*?<\/action>/g, '')  // Remover etiquetas de acción
              .replace(/Bot:\s*/g, '')                // Remover prefijos "Bot:"
              .replace(/<\/?answer>/g, '')            // Remover etiquetas <answer>
              .replace(/\n\s*\n/g, '\n')             // Limpiar líneas vacías múltiples
              .trim();

            // Reemplazar respuestas genéricas de crisis con números específicos de Colombia
            if (cleanText.includes('{PHONE}') || 
                (cleanText.includes('Suicide') && cleanText.includes('Hotline'))) {
              cleanText = `I'm really sorry you're feeling like this. You're not alone, and help is available right now.

📞 Línea 192 – Option 4 (Colombia): free and confidential emotional support, 24 hours a day.
📞 Línea 106 (Bogotá): crisis and suicide-prevention line.
💬 You can also send a WhatsApp message to +57 316 893 2673 for confidential chat support.

If you are in immediate danger, please reach out to someone you trust or go to the nearest emergency room.`;
            }
            
            if (cleanText) {
              // Manejar chunks del streaming de Bedrock
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.sender === 'assistant' && lastMessage.isStreaming) {
                  // Agregar chunk al último mensaje del asistente
                  return prev.map((msg, index) => 
                    index === prev.length - 1 
                      ? { ...msg, text: msg.text + cleanText }
                      : msg
                  );
                } else {
                  // Crear nuevo mensaje del asistente
                  return [...prev, { 
                    sender: 'assistant', 
                    text: cleanText,
                    isStreaming: true
                  }];
                }
              });
            }
          } else if (data.type === 'done') {
            console.log('✅ Finalizing streaming');
            // Finalizar streaming
            setMessages((prev) => 
              prev.map((msg, index) => 
                index === prev.length - 1 && msg.sender === 'assistant'
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
            setIsLoading(false);
          } else if (data.type === 'response' || data.message) {
            const assistantMessage = { 
              sender: 'assistant', 
              text: data.message || data.text || 'I received your message.'
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsLoading(false);
          }
        });

        // Set up connection status handler
        websocketService.onConnection((status) => {
          console.log('🔗 Connection status changed:', status);
          setIsConnected(status === 'connected');
        });

        // Set up error handler
        websocketService.onError((error) => {
          console.error('WebSocket connection error:', error);
          setMessages((prev) => [...prev, { 
            sender: 'assistant', 
            text: 'Sorry, there was a connection error. Please try again.' 
          }]);
          setIsLoading(false);
          setIsConnected(false);
        });

      } catch (error) {
        console.error('Failed to initialize WebSocket connection:', error);
        setIsConnected(false);
      }
    };

    initializeConnection();

    // Cleanup on component unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!userInput.trim() || !isConnected) return;
    
    const userMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    
    // Send message through WebSocket to API Gateway -> Lambda -> Bedrock
    const messageSent = websocketService.sendMessage(userInput);
    
    if (messageSent) {
      setUserInput('');
      setIsLoading(true);
      setHasStarted(true);
    } else {
      setMessages((prev) => [...prev, { 
        sender: 'assistant', 
        text: 'Connection lost. Please refresh the page to reconnect.' 
      }]);
    }
  };

  return (
    <div className="chat-wrapper">
      {!hasStarted ? (
        <div className="start-screen">
          <h2>How are you feeling today?</h2>
          <div className="start-input-box">
            <input
              type="text"
              placeholder="Type how you feel..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!isConnected}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isLoading || !isConnected}
              title={!isConnected ? 'Connecting to service...' : ''}
            >
              {isLoading ? '...' : isConnected ? 'Start' : 'Connecting...'}
            </button>
          </div>
          {!isConnected && (
            <p className="connection-status">Connecting to Bunny Buddy service...</p>
          )}
        </div>
      ) : (
        <>
          <div className="chat-box">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <p>{message.text}</p>
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your next thought..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!isConnected}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isLoading || !isConnected}
              title={!isConnected ? 'Connection lost' : ''}
            >
              {isLoading ? '...' : isConnected ? 'Send' : 'Disconnected'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPage;
