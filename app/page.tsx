'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/game');
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else if (data.user) {
      // Garante que o perfil/progresso exista para este jogador.
      await supabase.from('profiles').upsert(
        { id: data.user.id, email: data.user.email },
        { onConflict: 'id', ignoreDuplicates: true }
      );
      router.replace('/game');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Preencha e-mail e senha para criar a conta.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A senha precisa ter pelo menos 6 caracteres.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else if (data.user && !data.session) {
      setMessage({
        type: 'error',
        text: 'A conta foi criada, mas o Supabase ainda está exigindo confirmação por e-mail. No painel do Supabase, desative Authentication > Sign In / Providers > Email > Confirm email e tente criar a conta novamente.'
      });
    } else if (data.user && data.session) {
      await supabase.from('profiles').upsert(
        { id: data.user.id, email: data.user.email },
        { onConflict: 'id', ignoreDuplicates: true }
      );
      router.replace('/game');
    }
    setLoading(false);
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🐦</div>
        <h1 style={styles.title}>Flappy Level</h1>
        <p style={styles.subtitle}>Entre para jogar e salvar seu progresso.</p>

        {message && (
          <div style={{
            ...styles.alert,
            background: message.type === 'success' ? '#e8f7ee' : '#fdeaea',
            color: message.type === 'success' ? '#16733c' : '#b42318',
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </label>

          <button disabled={loading} type="submit" style={{ ...styles.button, background: '#f59e0b' }}>
            {loading ? 'Entrando...' : 'Entrar e jogar'}
          </button>

          <button disabled={loading} type="button" onClick={handleSignUp} style={{ ...styles.button, background: '#111827' }}>
            Criar conta
          </button>
        </form>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: 20, boxSizing: 'border-box' as const,
    background: 'linear-gradient(135deg, #bae6fd 0%, #fef3c7 100%)',
  },
  card: {
    width: '100%', maxWidth: 390, padding: 32, boxSizing: 'border-box' as const,
    borderRadius: 24, background: '#fff', boxShadow: '0 20px 60px rgba(15,23,42,.16)',
  },
  logo: { fontSize: 54, textAlign: 'center' as const },
  title: { margin: '8px 0 4px', textAlign: 'center' as const, fontSize: 32, color: '#111827' },
  subtitle: { margin: '0 0 24px', textAlign: 'center' as const, color: '#64748b' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: 16 },
  label: { display: 'flex', flexDirection: 'column' as const, gap: 7, fontWeight: 700, color: '#334155' },
  input: { padding: '13px 14px', border: '1px solid #cbd5e1', borderRadius: 12, fontSize: 16, boxSizing: 'border-box' as const },
  button: { border: 0, borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' },
  alert: { padding: 12, borderRadius: 12, marginBottom: 16, textAlign: 'center' as const, fontSize: 14 },
};
