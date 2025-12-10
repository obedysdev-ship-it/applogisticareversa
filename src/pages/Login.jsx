import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, AlertCircle } from 'lucide-react'

const SENHA_CORRETA = 'logisticadecaixas123@'

export default function Login() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    if (senha === SENHA_CORRETA) {
      localStorage.setItem('auth', 'true')
      setTimeout(() => {
        navigate('/Registros')
      }, 300)
    } else {
      setErro('Senha incorreta. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <Card className="w-full max-w-md shadow-2xl bg-white/80 backdrop-blur-md dark:bg-gray-800/80">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/58237d489_logisticareversa.png" 
              alt="Logo Grupo Docemel Logística Reversa" 
              className="h-24 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Sistema GDM
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Logística Reversa
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="senha" className="text-gray-700 font-semibold">
                Senha de Acesso
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-10"
                  autoFocus
                  required
                />
              </div>
            </div>
            
            {erro && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={loading || !senha}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
