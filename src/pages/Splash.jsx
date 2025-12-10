import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPageUrl } from '@/utils'

export default function Splash() {
  const navigate = useNavigate()
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('auth') === 'true'
    const t = setTimeout(() => {
      if (isAuthenticated) {
        navigate(createPageUrl('Registros'))
      } else {
        navigate('/Login')
      }
    }, 3000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="mb-8 animate-pulse">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b99f28277_splashcaixas.png" alt="Grupo Docemel Logística Reversa" className="mx-auto max-w-xs w-full h-auto drop-shadow-2xl" />
        </div>
        <div className="mt-8">
          <div className="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4 text-xl font-semibold">Carregando sistema GDM...</p>
          <p className="text-green-100 mt-2 text-sm">Logística Reversa</p>
        </div>
      </div>
    </div>
  )
}

