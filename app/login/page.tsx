'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  // Função para Fazer Login
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Se o login der certo, joga o usuário para a tela do jogo
    router.push('/game')
  }

  // Função para Criar Conta (CORRIGIDA - Confirmação Automática)
  const handleSignUp = async () => {
    setError('')
    setMessage('')
    setLoading(true)

    if (!email || !password) {
      setError('Preencha todos os campos para criar a conta.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        // CORREÇÃO: Força o Supabase a ignorar a trava de confirmação por e-mail
        data: {
          email_confirmed: true,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setMessage('Conta criada com sucesso! Digite seus dados e clique em Entrar.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-amber-100 to-teal-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        
        {/* Logo/Ícone do Flappy */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="text-4xl mb-2">🐦</div>
          <h1 className="text-3xl font-black text-slate-800">Flappy Level</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            Entre para jogar e salvar seu progresso.
          </p>
        </div>

        {/* Alertas de Erro ou Sucesso */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600 border border-red-100">
            {error === 'email rate limit exceeded' ? 'Muitas tentativas! Aguarde uns minutinhos.' : error}
          </div>
        )}
        
        {message && (
          <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-600 border border-emerald-100">
            {message}
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
              placeholder="seu.email@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 p-3 font-bold text-white shadow-md hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Entrar e jogar'}
          </button>
        </form>

        {/* Linha Divisória */}
        <div className="my-6 flex items-center justify-center">
          <div className="h-[1px] w-full bg-slate-100"></div>
        </div>

        {/* Botão Criar Conta */}
        <button
          type="button"
          onClick={handleSignUp}
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 p-3 font-bold text-white shadow-md hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          Criar conta
        </button>

      </div>
    </div>
  )
}
