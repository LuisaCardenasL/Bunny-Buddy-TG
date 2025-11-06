import '@testing-library/jest-dom'

// Mock WebSocket
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url
    this.readyState = 1
    setTimeout(() => {
      if (this.onopen) this.onopen()
    }, 100)
  }
  
  send(data) {
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({
          data: JSON.stringify({
            type: 'response',
            message: 'Respuesta de prueba empática'
          })
        })
      }
    }, 200)
  }
  
  close() {
    this.readyState = 3
    if (this.onclose) this.onclose()
  }
}

// Mock SpeechRecognition
global.SpeechRecognition = class MockSpeechRecognition {
  constructor() {
    this.continuous = false
    this.interimResults = false
    this.lang = 'es-ES'
  }
  
  start() {
    setTimeout(() => {
      if (this.onresult) {
        this.onresult({
          results: [{
            0: { transcript: 'texto de prueba' },
            isFinal: true
          }]
        })
      }
    }, 100)
  }
  
  stop() {}
}

global.webkitSpeechRecognition = global.SpeechRecognition
