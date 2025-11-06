import { describe, it, expect, beforeEach } from 'vitest'

// Métricas de rendimiento del sistema
class PerformanceMetrics {
  constructor() {
    this.metrics = {
      responseTime: [],
      throughput: 0,
      errorRate: 0,
      userSatisfaction: [],
      systemLoad: 0
    }
  }

  measureResponseTime(startTime, endTime) {
    const responseTime = endTime - startTime
    this.metrics.responseTime.push(responseTime)
    return responseTime
  }

  calculateAverageResponseTime() {
    if (this.metrics.responseTime.length === 0) return 0
    return this.metrics.responseTime.reduce((sum, time) => sum + time, 0) / this.metrics.responseTime.length
  }

  measureThroughput(messagesProcessed, timeWindow) {
    this.metrics.throughput = messagesProcessed / (timeWindow / 1000) // mensajes por segundo
    return this.metrics.throughput
  }

  recordError(totalRequests, errors) {
    this.metrics.errorRate = (errors / totalRequests) * 100
    return this.metrics.errorRate
  }

  recordUserSatisfaction(rating) {
    this.metrics.userSatisfaction.push(rating)
  }

  getAverageUserSatisfaction() {
    if (this.metrics.userSatisfaction.length === 0) return 0
    return this.metrics.userSatisfaction.reduce((sum, rating) => sum + rating, 0) / this.metrics.userSatisfaction.length
  }

  simulateSystemLoad(concurrentUsers) {
    // Simular carga del sistema basada en usuarios concurrentes
    this.metrics.systemLoad = Math.min((concurrentUsers / 100) * 100, 100)
    return this.metrics.systemLoad
  }

  getPerformanceReport() {
    return {
      averageResponseTime: this.calculateAverageResponseTime(),
      throughput: this.metrics.throughput,
      errorRate: this.metrics.errorRate,
      userSatisfaction: this.getAverageUserSatisfaction(),
      systemLoad: this.metrics.systemLoad,
      totalRequests: this.metrics.responseTime.length
    }
  }
}

// Simulador de carga de trabajo
class LoadSimulator {
  constructor() {
    this.metrics = new PerformanceMetrics()
  }

  async simulateUserInteraction(message, delay = 100) {
    const startTime = Date.now()
    
    // Simular procesamiento del mensaje
    await new Promise(resolve => setTimeout(resolve, delay))
    
    const endTime = Date.now()
    const responseTime = this.metrics.measureResponseTime(startTime, endTime)
    
    // Simular satisfacción del usuario basada en tiempo de respuesta
    let satisfaction = 5
    if (responseTime > 2000) satisfaction = 2
    else if (responseTime > 1000) satisfaction = 3
    else if (responseTime > 500) satisfaction = 4
    
    this.metrics.recordUserSatisfaction(satisfaction)
    
    return {
      responseTime,
      satisfaction,
      success: responseTime < 3000
    }
  }

  async simulateConcurrentUsers(userCount, messagesPerUser = 5) {
    const startTime = Date.now()
    const promises = []

    for (let user = 0; user < userCount; user++) {
      for (let msg = 0; msg < messagesPerUser; msg++) {
        promises.push(
          this.simulateUserInteraction(`Usuario ${user} - Mensaje ${msg}`, Math.random() * 200 + 50)
        )
      }
    }

    const results = await Promise.all(promises)
    const endTime = Date.now()
    
    const totalMessages = userCount * messagesPerUser
    const timeWindow = endTime - startTime
    
    this.metrics.measureThroughput(totalMessages, timeWindow)
    this.metrics.simulateSystemLoad(userCount)
    
    const errors = results.filter(r => !r.success).length
    this.metrics.recordError(totalMessages, errors)
    
    return {
      totalMessages,
      timeWindow,
      successfulMessages: results.filter(r => r.success).length,
      errors
    }
  }
}

describe('Pruebas de Rendimiento y Métricas', () => {
  let performanceMetrics
  let loadSimulator

  beforeEach(() => {
    performanceMetrics = new PerformanceMetrics()
    loadSimulator = new LoadSimulator()
  })

  describe('Métricas de Tiempo de Respuesta', () => {
    it('debe medir tiempos de respuesta correctamente', () => {
      const startTime = Date.now()
      const endTime = startTime + 500
      
      const responseTime = performanceMetrics.measureResponseTime(startTime, endTime)
      
      expect(responseTime).toBe(500)
      expect(performanceMetrics.calculateAverageResponseTime()).toBe(500)
    })

    it('debe calcular promedio de múltiples respuestas', () => {
      performanceMetrics.measureResponseTime(0, 100)
      performanceMetrics.measureResponseTime(0, 200)
      performanceMetrics.measureResponseTime(0, 300)
      
      expect(performanceMetrics.calculateAverageResponseTime()).toBe(200)
    })

    it('debe mantener tiempos de respuesta bajo carga normal', async () => {
      const result = await loadSimulator.simulateUserInteraction('Test message')
      
      expect(result.responseTime).toBeLessThan(1000)
      expect(result.success).toBe(true)
      expect(result.satisfaction).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Métricas de Throughput', () => {
    it('debe calcular throughput correctamente', () => {
      const throughput = performanceMetrics.measureThroughput(100, 10000) // 100 mensajes en 10 segundos
      
      expect(throughput).toBe(10) // 10 mensajes por segundo
    })

    it('debe manejar múltiples usuarios concurrentes', async () => {
      const result = await loadSimulator.simulateConcurrentUsers(10, 3)
      const report = loadSimulator.metrics.getPerformanceReport()
      
      expect(result.totalMessages).toBe(30)
      expect(result.successfulMessages).toBeGreaterThan(25)
      expect(report.throughput).toBeGreaterThan(0)
    })
  })

  describe('Métricas de Calidad', () => {
    it('debe mantener baja tasa de errores', async () => {
      await loadSimulator.simulateConcurrentUsers(5, 10)
      const report = loadSimulator.metrics.getPerformanceReport()
      
      expect(report.errorRate).toBeLessThan(5) // Menos del 5% de errores
    })

    it('debe mantener alta satisfacción del usuario', async () => {
      // Simular respuestas rápidas
      for (let i = 0; i < 10; i++) {
        await loadSimulator.simulateUserInteraction('Test', 200)
      }
      
      const report = loadSimulator.metrics.getPerformanceReport()
      expect(report.userSatisfaction).toBeGreaterThan(3.5)
    })
  })

  describe('Pruebas de Carga', () => {
    it('debe manejar carga ligera eficientemente', async () => {
      const result = await loadSimulator.simulateConcurrentUsers(5, 2)
      const report = loadSimulator.metrics.getPerformanceReport()
      
      expect(report.averageResponseTime).toBeLessThan(500)
      expect(report.errorRate).toBe(0)
      expect(report.systemLoad).toBeLessThan(10)
    })

    it('debe degradarse graciosamente bajo carga alta', async () => {
      const result = await loadSimulator.simulateConcurrentUsers(50, 3)
      const report = loadSimulator.metrics.getPerformanceReport()
      
      expect(report.averageResponseTime).toBeLessThan(2000)
      expect(report.errorRate).toBeLessThan(10)
      expect(report.systemLoad).toBeGreaterThan(40)
    })

    it('debe procesar mensajes en tiempo real', async () => {
      const messages = ['Mensaje 1', 'Mensaje 2', 'Mensaje 3']
      const startTime = Date.now()
      
      const results = await Promise.all(
        messages.map(msg => loadSimulator.simulateUserInteraction(msg, 100))
      )
      
      const totalTime = Date.now() - startTime
      
      expect(totalTime).toBeLessThan(1000) // Procesamiento concurrente
      expect(results.every(r => r.success)).toBe(true)
    })
  })

  describe('Métricas de Sistema', () => {
    it('debe generar reporte completo de rendimiento', async () => {
      await loadSimulator.simulateConcurrentUsers(10, 5)
      const report = loadSimulator.metrics.getPerformanceReport()
      
      expect(report).toHaveProperty('averageResponseTime')
      expect(report).toHaveProperty('throughput')
      expect(report).toHaveProperty('errorRate')
      expect(report).toHaveProperty('userSatisfaction')
      expect(report).toHaveProperty('systemLoad')
      expect(report).toHaveProperty('totalRequests')
      
      expect(report.totalRequests).toBe(50)
    })

    it('debe identificar cuellos de botella', async () => {
      // Simular respuestas lentas
      for (let i = 0; i < 5; i++) {
        await loadSimulator.simulateUserInteraction('Slow message', 1500)
      }
      
      const report = loadSimulator.metrics.getPerformanceReport()
      
      expect(report.averageResponseTime).toBeGreaterThan(1000)
      expect(report.userSatisfaction).toBeLessThan(4)
    })
  })
})
