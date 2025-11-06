import { describe, it, expect, beforeEach } from 'vitest'

// Simulación de casos de prueba con usuarios
const testScenarios = [
  {
    id: 1,
    emotion: 'tristeza',
    userMessage: 'Me siento muy triste y solo, no sé qué hacer',
    expectedResponseType: 'empathic_support',
    context: 'estudiante_universitario'
  },
  {
    id: 2,
    emotion: 'ansiedad',
    userMessage: 'Tengo mucha ansiedad por los exámenes finales',
    expectedResponseType: 'calming_guidance',
    context: 'periodo_examenes'
  },
  {
    id: 3,
    emotion: 'enojo',
    userMessage: 'Estoy muy frustrado con todo, nada me sale bien',
    expectedResponseType: 'validation_support',
    context: 'frustracion_academica'
  },
  {
    id: 4,
    emotion: 'alegría',
    userMessage: 'Aprobé todos mis exámenes, estoy muy feliz',
    expectedResponseType: 'celebration',
    context: 'logro_academico'
  }
]

// Función para evaluar la experiencia del usuario
function evaluateUserExperience(scenario, response) {
  const metrics = {
    relevance: 0,
    empathy: 0,
    helpfulness: 0,
    appropriateness: 0,
    engagement: 0
  }

  const lowerResponse = response.toLowerCase()

  // Evaluar relevancia
  const emotionKeywords = {
    tristeza: ['triste', 'solo', 'difícil', 'comprendo', 'entiendo'],
    ansiedad: ['ansioso', 'nervioso', 'tranquilo', 'respira', 'calma'],
    enojo: ['frustrado', 'molesto', 'válido', 'comprensible'],
    alegría: ['feliz', 'alegra', 'celebrar', 'maravilloso', 'genial']
  }

  if (emotionKeywords[scenario.emotion]) {
    const relevantKeywords = emotionKeywords[scenario.emotion].filter(keyword =>
      lowerResponse.includes(keyword)
    )
    metrics.relevance = Math.min(relevantKeywords.length / 2, 1)
  }

  // Evaluar empatía
  const empathyIndicators = ['entiendo', 'comprendo', 'siento', 'lamento', 'acompaño']
  const empathyScore = empathyIndicators.filter(indicator =>
    lowerResponse.includes(indicator)
  ).length
  metrics.empathy = Math.min(empathyScore / 2, 1)

  // Evaluar utilidad
  const helpfulIndicators = ['ayuda', 'apoyo', 'juntos', 'puedes', 'intenta']
  const helpfulScore = helpfulIndicators.filter(indicator =>
    lowerResponse.includes(indicator)
  ).length
  metrics.helpfulness = Math.min(helpfulScore / 2, 1)

  // Evaluar apropiación
  metrics.appropriateness = response.length > 30 && response.length < 200 ? 1 : 0.5

  // Evaluar engagement
  const engagementIndicators = ['?', 'cuéntame', 'más', 'cómo', 'qué']
  const engagementScore = engagementIndicators.filter(indicator =>
    lowerResponse.includes(indicator)
  ).length
  metrics.engagement = Math.min(engagementScore / 2, 1)

  const overallScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / 5

  return {
    ...metrics,
    overallScore,
    passed: overallScore >= 0.6
  }
}

// Función para simular respuesta del asistente
function simulateAssistantResponse(scenario) {
  const responses = {
    tristeza: 'Entiendo que te sientes triste y solo. Es normal pasar por momentos difíciles. Estoy aquí para acompañarte. ¿Te gustaría contarme más sobre lo que está pasando?',
    ansiedad: 'Comprendo tu ansiedad por los exámenes. Es normal sentirse nervioso ante situaciones importantes. Respira profundo y recuerda que has estudiado. ¿Qué técnicas de relajación conoces?',
    enojo: 'Veo que estás muy frustrado y es completamente válido sentirse así cuando las cosas no salen como esperamos. Tu enojo es comprensible. ¿Qué situación específica te está molestando más?',
    alegría: '¡Qué maravilloso que hayas aprobado todos tus exámenes! Me alegra mucho saber de tu éxito. Es el resultado de tu esfuerzo y dedicación. ¿Cómo planeas celebrar este logro?'
  }

  return responses[scenario.emotion] || 'Gracias por compartir conmigo. Estoy aquí para escucharte y apoyarte en lo que necesites.'
}

describe('Pruebas de Experiencia del Usuario', () => {
  testScenarios.forEach(scenario => {
    describe(`Escenario ${scenario.id}: ${scenario.emotion}`, () => {
      it('debe generar respuesta apropiada para el contexto emocional', () => {
        const response = simulateAssistantResponse(scenario)
        const evaluation = evaluateUserExperience(scenario, response)

        expect(evaluation.relevance).toBeGreaterThan(0.5)
        expect(evaluation.appropriateness).toBeGreaterThan(0.5)
        expect(response).toBeDefined()
        expect(response.length).toBeGreaterThan(20)
      })

      it('debe mostrar empatía adecuada', () => {
        const response = simulateAssistantResponse(scenario)
        const evaluation = evaluateUserExperience(scenario, response)

        expect(evaluation.empathy).toBeGreaterThan(0.3)
        expect(evaluation.overallScore).toBeGreaterThan(0.6)
      })

      it('debe ser útil y ofrecer apoyo', () => {
        const response = simulateAssistantResponse(scenario)
        const evaluation = evaluateUserExperience(scenario, response)

        expect(evaluation.helpfulness).toBeGreaterThan(0.3)
        expect(evaluation.passed).toBe(true)
      })

      it('debe fomentar la continuación de la conversación', () => {
        const response = simulateAssistantResponse(scenario)
        const evaluation = evaluateUserExperience(scenario, response)

        expect(evaluation.engagement).toBeGreaterThan(0.2)
        expect(response).toMatch(/\?/)
      })
    })
  })

  describe('Métricas Generales de Experiencia', () => {
    it('debe mantener consistencia en todas las respuestas', () => {
      const responses = testScenarios.map(scenario => ({
        scenario,
        response: simulateAssistantResponse(scenario),
      }))

      const evaluations = responses.map(({ scenario, response }) =>
        evaluateUserExperience(scenario, response)
      )

      const averageScore = evaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / evaluations.length

      expect(averageScore).toBeGreaterThan(0.7)
      expect(evaluations.every(eval => eval.passed)).toBe(true)
    })

    it('debe adaptar el tono según la emoción', () => {
      const sadResponse = simulateAssistantResponse(testScenarios[0])
      const happyResponse = simulateAssistantResponse(testScenarios[3])

      expect(sadResponse.toLowerCase()).toMatch(/entiendo|comprendo|acompaño/)
      expect(happyResponse.toLowerCase()).toMatch(/maravilloso|alegra|genial/)
      expect(sadResponse.toLowerCase()).not.toMatch(/genial|maravilloso/)
      expect(happyResponse.toLowerCase()).not.toMatch(/triste|difícil/)
    })

    it('debe medir tiempo de respuesta percibido', () => {
      const startTime = Date.now()
      const response = simulateAssistantResponse(testScenarios[0])
      const responseTime = Date.now() - startTime

      expect(response).toBeDefined()
      expect(responseTime).toBeLessThan(100) // Respuesta inmediata en simulación
    })
  })
})
