// WebSocket service for connecting to AWS API Gateway
// Following the architecture: User -> CloudFront -> API Gateway WebSockets -> Lambda -> Bedrock

class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.errorHandlers = [];
    this.mockMode = false;
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      try {
        // Intentar conexión real tanto en desarrollo como en producción
        // CONEXIÓN DESHABILITADA POR SEGURIDAD
        // Para habilitar conexión real, contactar al desarrollador
        console.log('🔒 Real WebSocket connection disabled for security');
        this.enableMockMode();
        resolve(this.ws);
        return;
        
        // const wsUrl = url || import.meta.env.VITE_WS_URL;
        
        // Si no hay URL configurada, activar modo mock automáticamente
        if (!wsUrl) {
          console.log('🎭 No WebSocket URL configured, enabling mock mode');
          this.enableMockMode();
          resolve(this.ws);
          return;
        }
        
        console.log(`🔌 Attempting to connect to: ${wsUrl}`);
        
        const realWs = new WebSocket(wsUrl);
        this.ws = realWs;
        console.log('🔍 Created WebSocket:', this.ws);
        let isConnected = false;

        realWs.onopen = () => {
          console.log('✅ REAL WebSocket connected to AWS API Gateway');
          isConnected = true;
          clearTimeout(connectionTimeout);
          this.mockMode = false;
          this.ws = realWs;
          // Inmediatamente notificar conexión exitosa
          setTimeout(() => {
            this.connectionHandlers.forEach(handler => handler('connected'));
          }, 100);
          resolve(this.ws);
        };

        realWs.onmessage = (event) => {
          console.log('📨 Real message received:', event.data);
          try {
            const data = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(data));
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        // Timeout para dar tiempo a la conexión
        const connectionTimeout = setTimeout(() => {
          if (!isConnected) {
            console.log('🕐 Connection timeout, falling back to MOCK MODE');
            this.enableMockMode();
            resolve(this.ws);
          }
        }, 5000); // 5 segundos

        realWs.onerror = (error) => {
          console.error('❌ Real WebSocket error:', error);
          clearTimeout(connectionTimeout);
          if (!isConnected) {
            console.log('🎭 Falling back to MOCK MODE');
            this.enableMockMode();
            resolve(this.ws);
          }
          this.errorHandlers.forEach(handler => handler(error));
        };

        realWs.onclose = () => {
          console.log('🔌 Real WebSocket connection closed');
          this.connectionHandlers.forEach(handler => handler('disconnected'));
        };

      } catch (error) {
        console.log('🎭 Connection failed, using MOCK MODE');
        this.enableMockMode();
        resolve(this.ws);
      }
    });
  }

  enableMockMode() {
    console.log('🐰 Mock mode enabled - simulating Bunny Buddy responses');
    console.log('🔍 this.ws before enableMockMode:', this.ws);
    this.mockMode = true;
    
    // Solo crear objeto mock si no hay conexión real activa
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('🔍 Creating mock WebSocket object');
      this.ws = { readyState: 1 }; // WebSocket.OPEN = 1
    } else {
      console.log('🔍 Keeping real WebSocket connection');
    }
    
    console.log('🔍 this.ws after enableMockMode:', this.ws);
    
    // Activar el estado de conexión después de que se registren los handlers
    setTimeout(() => {
      this.connectionHandlers.forEach(handler => handler('connected'));
    }, 100);
  }

  sendMessage(message) {
    console.log('🔍 DEBUG sendMessage - mockMode:', this.mockMode);
    console.log('🔍 DEBUG sendMessage - this.ws:', this.ws);
    console.log('🔍 DEBUG sendMessage - this.ws.readyState:', this.ws?.readyState);
    console.log('🔍 DEBUG sendMessage - typeof this.ws.send:', typeof this.ws?.send);
    
    if (this.mockMode) {
      console.log('🎭 MOCK: Sending message:', message);
      // Simulate response in mock mode
      setTimeout(() => {
        const mockResponses = [
          "¡Hola! Soy Bunny Buddy 🐰. Estoy aquí para escucharte y apoyarte. ¿Cómo te sientes hoy?",
          "Entiendo cómo te sientes. Es completamente normal tener esos sentimientos. ¿Te gustaría contarme más?",
          "Eres muy valiente por compartir esto conmigo. Recuerda que siempre hay esperanza y que no estás solo/a.",
          "Me alegra que confíes en mí. Juntos podemos encontrar maneras de hacer que te sientas mejor. 💙"
        ];
        
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        console.log('🎭 MOCK: Sending response:', randomResponse);
        this.messageHandlers.forEach(handler => handler({
          type: 'response',
          message: randomResponse
        }));
      }, 1500);
      return true;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ REAL: Sending message via WebSocket:', message);
      // Send message to API Gateway which will route to Lambda -> Bedrock
      this.ws.send(JSON.stringify({
        action: 'sendMessage',
        message: message,
        timestamp: new Date().toISOString()
      }));
      return true;
    }
    
    console.log('❌ Cannot send message - WebSocket not ready');
    return false;
  }

  onMessage(handler) {
    this.messageHandlers = [handler]; // Replace instead of accumulate
  }

  onConnection(handler) {
    this.connectionHandlers = [handler]; // Replace instead of accumulate
  }

  onError(handler) {
    this.errorHandlers = [handler]; // Replace instead of accumulate
  }

  disconnect() {
    if (this.ws && !this.mockMode) {
      this.ws.close();
    }
    this.ws = null;
    this.mockMode = false;
  }

  isConnected() {
    return this.ws && (this.mockMode || this.ws.readyState === WebSocket.OPEN);
  }
}

export default new WebSocketService();
