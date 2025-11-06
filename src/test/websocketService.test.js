import { describe, it, expect, beforeEach, vi } from 'vitest'
import WebSocketService from '../services/websocketService.js'

describe('Pruebas de Funcionalidad WebSocket', () => {
  beforeEach(() => {
    // Reset service state
    WebSocketService.disconnect()
    WebSocketService.mockMode = false
  })

  it('debe conectarse en modo mock cuando falla la conexión real', async () => {
    const ws = await WebSocketService.connect('wss://invalid-url')
    
    expect(WebSocketService.mockMode).toBe(true)
    expect(WebSocketService.isConnected()).toBe(true)
  })

  it('debe enviar mensajes en modo mock', async () => {
    await WebSocketService.connect()
    
    const messageReceived = new Promise((resolve) => {
      WebSocketService.onMessage((data) => {
        resolve(data)
      })
    })

    WebSocketService.sendMessage('Hola, me siento triste')
    
    const response = await messageReceived
    expect(response.type).toBe('response')
    expect(response.message).toBeDefined()
    expect(response.message.length).toBeGreaterThan(10)
  })

  it('debe manejar múltiples mensajes consecutivos', async () => {
    await WebSocketService.connect()
    
    const messages = []
    WebSocketService.onMessage((data) => {
      messages.push(data)
    })

    WebSocketService.sendMessage('Mensaje 1')
    WebSocketService.sendMessage('Mensaje 2')
    
    // Wait for responses
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    expect(messages.length).toBe(2)
    messages.forEach(msg => {
      expect(msg.type).toBe('response')
      expect(msg.message).toBeDefined()
    })
  })

  it('debe notificar cambios de estado de conexión', async () => {
    const connectionStates = []
    
    WebSocketService.onConnection((state) => {
      connectionStates.push(state)
    })

    await WebSocketService.connect()
    
    // Wait for connection event
    await new Promise(resolve => setTimeout(resolve, 200))
    
    expect(connectionStates).toContain('connected')
  })

  it('debe medir tiempo de respuesta', async () => {
    await WebSocketService.connect()
    
    const startTime = Date.now()
    
    const responseReceived = new Promise((resolve) => {
      WebSocketService.onMessage((data) => {
        const responseTime = Date.now() - startTime
        resolve(responseTime)
      })
    })

    WebSocketService.sendMessage('Test message')
    
    const responseTime = await responseReceived
    expect(responseTime).toBeLessThan(3000) // Menos de 3 segundos
  })

  it('debe desconectarse correctamente', async () => {
    await WebSocketService.connect()
    expect(WebSocketService.isConnected()).toBe(true)
    
    WebSocketService.disconnect()
    expect(WebSocketService.isConnected()).toBe(false)
  })

  it('debe manejar errores de envío cuando no está conectado', () => {
    const result = WebSocketService.sendMessage('Test message')
    expect(result).toBe(false)
  })
})
