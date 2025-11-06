import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import ChatPage from '../ChatPage.jsx'
import LandingPage from '../LandingPage.jsx'
import App from '../App.jsx'

// Mock del servicio WebSocket
vi.mock('../services/websocketService', () => ({
  default: {
    connect: vi.fn().mockResolvedValue({}),
    onMessage: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
    sendMessage: vi.fn().mockReturnValue(true),
    isConnected: vi.fn().mockReturnValue(true),
    disconnect: vi.fn()
  }
}))

describe('Pruebas de Componentes Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('LandingPage', () => {
    it('debe renderizar correctamente', () => {
      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      )
      
      expect(screen.getByText(/BunnyBuddy/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
    })

    it('debe navegar al chat al hacer clic en comenzar', async () => {
      const user = userEvent.setup()
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      
      const startButton = screen.getByRole('button', { name: /start/i })
      await user.click(startButton)
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/chat')
      })
    })
  })

  describe('ChatPage', () => {
    it('debe renderizar la interfaz de chat', () => {
      render(
        <BrowserRouter>
          <ChatPage />
        </BrowserRouter>
      )
      
      expect(screen.getByText(/How are you feeling today/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/type how you feel/i)).toBeInTheDocument()
    })

    it('debe mostrar estado de conexión', () => {
      render(
        <BrowserRouter>
          <ChatPage />
        </BrowserRouter>
      )
      
      expect(screen.getByText(/Connecting to Bunny Buddy service/i)).toBeInTheDocument()
    })

    it('debe mostrar botón deshabilitado mientras conecta', () => {
      render(
        <BrowserRouter>
          <ChatPage />
        </BrowserRouter>
      )
      
      const button = screen.getByRole('button', { name: /connecting/i })
      expect(button).toBeDisabled()
    })

    it('debe mostrar input deshabilitado mientras conecta', () => {
      render(
        <BrowserRouter>
          <ChatPage />
        </BrowserRouter>
      )
      
      const input = screen.getByPlaceholderText(/type how you feel/i)
      expect(input).toBeDisabled()
    })
  })

  describe('App Navigation', () => {
    it('debe renderizar la landing page por defecto', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      
      expect(screen.getByText(/BunnyBuddy/i)).toBeInTheDocument()
    })

    it('debe mostrar header con logo', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByAltText(/Logo/i)).toBeInTheDocument()
    })
  })
})
