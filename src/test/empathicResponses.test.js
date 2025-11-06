import { describe, it, expect } from 'vitest'

// Función para generar respuestas empáticas
function generateEmpathicResponse(emotion, message) {
  const responses = {
    tristeza: [
      'Entiendo que te sientes triste. Es normal sentirse así a veces. ¿Te gustaría contarme más sobre lo que está pasando?',
      'Lamento que estés pasando por un momento difícil. Recuerda que no estás solo/a en esto.',
      'Es válido sentirse triste. Tus emociones son importantes y merecen ser escuchadas.'
    ],
    ansiedad: [
      'Comprendo que te sientes ansioso/a. La ansiedad puede ser abrumadora, pero podemos trabajar juntos para manejarla.',
      'Es normal sentir ansiedad. Respira profundo y recuerda que este sentimiento pasará.',
      'Entiendo tu preocupación. ¿Qué te ayudaría a sentirte más tranquilo/a en este momento?'
    ],
    enojo: [
      'Veo que estás molesto/a. Es comprensible sentir enojo ante ciertas situaciones.',
      'Tu enojo es válido. ¿Te gustaría hablar sobre lo que te está molestando?',
      'Entiendo tu frustración. A veces es necesario expresar estos sentimientos.'
    ],
    alegría: [
      '¡Qué maravilloso que te sientas feliz! Me alegra saber que estás bien.',
      'Es hermoso verte tan contento/a. ¿Qué ha hecho que te sientas así de bien?',
      'Tu alegría es contagiosa. Me da mucho gusto saber que estás pasando por un buen momento.'
    ],
    neutral: [
      'Te escucho. ¿Hay algo específico en lo que te gustaría que te ayude?',
      'Estoy aquí para ti. ¿Cómo te sientes en este momento?',
      'Gracias por compartir conmigo. ¿Qué más te gustaría conversar?'
    ]
  }
  
  const emotionResponses = responses[emotion] || responses.neutral
  return emotionResponses[Math.floor(Math.random() * emotionResponses.length)]
}

// Función para evaluar calidad de respuesta
function evaluateResponseQuality(emotion, response) {
  const empathyKeywords = ['entiendo', 'comprendo', 'lamento', 'válido', 'normal', 'escucho']
  const supportKeywords = ['aquí para ti', 'no estás solo', 'juntos', 'ayude', 'apoyo', 'ayudarte']
  
  const hasEmpathy = empathyKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  )
  const hasSupport = supportKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  )
  
  return {
    hasEmpathy,
    hasSupport,
    isRelevant: response.length > 20,
    score: (hasEmpathy ? 1 : 0) + (hasSupport ? 1 : 0) + (response.length > 20 ? 1 : 0)
  }
}

describe('Pruebas de Calidad de Respuestas Empáticas', () => {
  it('debe generar respuestas empáticas para tristeza', () => {
    const response = generateEmpathicResponse('tristeza', 'Me siento muy triste')
    const quality = evaluateResponseQuality('tristeza', response)
    
    expect(response).toBeDefined()
    expect(response.length).toBeGreaterThan(20)
    expect(quality.hasEmpathy).toBe(true)
  })

  it('debe generar respuestas apropiadas para ansiedad', () => {
    const response = generateEmpathicResponse('ansiedad', 'Estoy muy ansioso')
    const quality = evaluateResponseQuality('ansiedad', response)
    
    expect(response).toBeDefined()
    expect(quality.score).toBeGreaterThanOrEqual(2)
  })

  it('debe generar respuestas de apoyo para enojo', () => {
    const response = generateEmpathicResponse('enojo', 'Estoy muy molesto')
    
    expect(response).toBeDefined()
    expect(response.toLowerCase()).toMatch(/válido|comprensible|entiendo/)
  })

  it('debe celebrar emociones positivas', () => {
    const response = generateEmpathicResponse('alegría', 'Me siento muy feliz')
    
    expect(response).toBeDefined()
    expect(response.toLowerCase()).toMatch(/maravilloso|alegra|hermoso|gusto/)
  })

  it('debe manejar estados neutrales apropiadamente', () => {
    const response = generateEmpathicResponse('neutral', 'Hola')
    const quality = evaluateResponseQuality('neutral', response)
    
    expect(response).toBeDefined()
    expect(quality.isRelevant).toBe(true)
  })

  it('debe mantener coherencia emocional', () => {
    const sadResponse = generateEmpathicResponse('tristeza', 'Estoy triste')
    const happyResponse = generateEmpathicResponse('alegría', 'Estoy feliz')
    
    expect(sadResponse.toLowerCase()).not.toMatch(/feliz|alegre|genial/)
    expect(happyResponse.toLowerCase()).not.toMatch(/triste|lamento|difícil/)
  })

  it('debe evaluar calidad de respuestas correctamente', () => {
    const goodResponse = 'Entiendo que te sientes triste. Estoy aquí para ayudarte en lo que necesites.'
    const quality = evaluateResponseQuality('tristeza', goodResponse)
    
    expect(quality.hasEmpathy).toBe(true)
    expect(quality.hasSupport).toBe(true)
    expect(quality.isRelevant).toBe(true)
    expect(quality.score).toBe(3)
  })
})
