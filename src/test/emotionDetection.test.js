import { describe, it, expect } from 'vitest'

// Función para detectar emociones (implementación básica)
function detectEmotion(text) {
  const emotions = {
    tristeza: ['triste', 'deprimido', 'solo', 'vacío', 'llorar'],
    ansiedad: ['ansioso', 'nervioso', 'preocupado', 'estrés', 'pánico'],
    enojo: ['enojado', 'furioso', 'molesto', 'irritado', 'rabia'],
    alegría: ['feliz', 'contento', 'alegre', 'bien', 'genial'],
    miedo: ['miedo', 'asustado', 'terror', 'temor', 'pánico']
  }
  
  const lowerText = text.toLowerCase()
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return emotion
    }
  }
  
  return 'neutral'
}

describe('Pruebas de Interpretación Emocional', () => {
  it('debe detectar tristeza correctamente', () => {
    expect(detectEmotion('Me siento muy triste hoy')).toBe('tristeza')
    expect(detectEmotion('Estoy deprimido y solo')).toBe('tristeza')
  })

  it('debe detectar ansiedad correctamente', () => {
    expect(detectEmotion('Estoy muy ansioso por el examen')).toBe('ansiedad')
    expect(detectEmotion('Me siento nervioso y preocupado')).toBe('ansiedad')
  })

  it('debe detectar enojo correctamente', () => {
    expect(detectEmotion('Estoy muy enojado con esta situación')).toBe('enojo')
    expect(detectEmotion('Me da mucha rabia esto')).toBe('enojo')
  })

  it('debe detectar alegría correctamente', () => {
    expect(detectEmotion('Me siento muy feliz hoy')).toBe('alegría')
    expect(detectEmotion('Estoy contento con los resultados')).toBe('alegría')
  })

  it('debe manejar texto neutral', () => {
    expect(detectEmotion('Hola, ¿cómo estás?')).toBe('neutral')
    expect(detectEmotion('El clima está nublado')).toBe('neutral')
  })

  it('debe manejar emociones mixtas (primera detectada)', () => {
    expect(detectEmotion('Estoy triste pero también enojado')).toBe('tristeza')
  })

  it('debe ser insensible a mayúsculas', () => {
    expect(detectEmotion('ESTOY MUY TRISTE')).toBe('tristeza')
    expect(detectEmotion('Estoy MUY ANSIOSO')).toBe('ansiedad')
  })
})
