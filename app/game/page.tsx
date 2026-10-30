'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Profile = {
  id: string;
  email: string | null;
  level: number;
  xp: number;
  best_score: number;
};

type Pipe = { x: number; gapY: number; passed: boolean };

const WIDTH = 360;
const HEIGHT = 560;
const BIRD_X = 82;
const BIRD_SIZE = 28;
const PIPE_WIDTH = 58;
const GAP = 155;
const GRAVITY = 0.38;
const FLAP = -7.1;
const PIPE_SPEED = 2.65;

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const gameRef = useRef({
    running: false, started: false, over: false, birdY: HEIGHT / 2, velocity: 0,
    score: 0, pipes: [] as Pipe[], lastTime: 0,
  });

  const [profile, setProfile] = useState<Profile | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'over'>('ready');
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    let { data } = await supabase.from('profiles').select('id,email,level,xp,best_score').eq('id', user.id).maybeSingle();
    if (!data) {
      const { data: created } = await supabase.from('profiles')
        .insert({ id: user.id, email: user.email, level: 1, xp: 0, best_score: 0 })
        .select('id,email,level,xp,best_score')
        .single();
      data = created;
    }
    if (data) setProfile(data as Profile);
    setLoading(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const saveProgress = useCallback(async (finalScore: number) => {
    if (!profile) return;
    const newBest = Math.max(profile.best_score, finalScore);
    const newLevel = Math.floor(newBest / 5) + 1;
    const newXp = newBest % 5;
    const { data } = await supabase.from('profiles')
      .update({ best_score: newBest, level: newLevel, xp: newXp })
      .eq('id', profile.id)
      .select('id,email,level,xp,best_score')
      .single();
    if (data) setProfile(data as Profile);
  }, [profile]);

  const resetGame = useCallback(() => {
    const s = gameRef.current;
    s.started = true; s.running = true; s.over = false; s.birdY = HEIGHT / 2;
    s.velocity = 0; s.score = 0; s.lastTime = performance.now();
    s.pipes = [
      { x: WIDTH + 70, gapY: 230, passed: false },
      { x: WIDTH + 260, gapY: 350, passed: false },
    ];
    setScore(0);
    setGameState('playing');
  }, []);

  const flap = useCallback(() => {
    const s = gameRef.current;
    if (!s.started || s.over) { resetGame(); return; }
    s.velocity = FLAP;
  }, [resetGame]);

  const endGame = useCallback(() => {
    const s = gameRef.current;
    if (s.over) return;
    s.running = false; s.over = true;
    setGameState('over');
    saveProgress(s.score);
  }, [saveProgress]);

  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const s = gameRef.current;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Céu
      const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      sky.addColorStop(0, '#7dd3fc'); sky.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Nuvens simples
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      [[40,90],[260,135],[150,45]].forEach(([x,y]) => {
        ctx.beginPath(); ctx.arc(x,y,20,0,Math.PI*2); ctx.arc(x+22,y+4,15,0,Math.PI*2); ctx.arc(x-20,y+7,14,0,Math.PI*2); ctx.fill();
      });

      // Cano
      s.pipes.forEach(p => {
        ctx.fillStyle = '#22c55e';
        const topH = p.gapY - GAP / 2;
        const bottomY = p.gapY + GAP / 2;
        ctx.fillRect(p.x, 0, PIPE_WIDTH, topH);
        ctx.fillRect(p.x, bottomY, PIPE_WIDTH, HEIGHT - bottomY);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(p.x - 4, topH - 18, PIPE_WIDTH + 8, 18);
        ctx.fillRect(p.x - 4, bottomY, PIPE_WIDTH + 8, 18);
      });

      // Chão
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(0, HEIGHT - 22, WIDTH, 22);
      ctx.fillStyle = '#a16207'; ctx.fillRect(0, HEIGHT - 5, WIDTH, 5);

      // Pássaro
      ctx.save();
      ctx.translate(BIRD_X, s.birdY);
      ctx.rotate(Math.max(-0.5, Math.min(0.8, s.velocity / 10)));
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(25, 6); ctx.lineTo(12, 10); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(7,-9,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(9,-9,3,0,Math.PI*2); ctx.fill();
      ctx.restore();

      // Pontuação
      ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 4;
      ctx.font = 'bold 42px system-ui'; ctx.textAlign = 'center';
      ctx.strokeText(String(s.score), WIDTH/2, 60); ctx.fillText(String(s.score), WIDTH/2, 60);

      if (!s.started || s.over) {
        ctx.fillStyle = 'rgba(15,23,42,.45)'; ctx.fillRect(0,0,WIDTH,HEIGHT);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 28px system-ui';
        ctx.fillText(s.over ? 'Fim de jogo!' : 'Flappy Level', WIDTH/2, 245);
        ctx.font = '16px system-ui';
        ctx.fillText(s.over ? 'Toque para jogar novamente' : 'Toque ou pressione ESPAÇO', WIDTH/2, 280);
      }
    };

    const tick = (now: number) => {
      const s = gameRef.current;
      if (s.running) {
        const dt = Math.min((now - s.lastTime) / 16.67, 2);
        s.lastTime = now;
        s.velocity += GRAVITY * dt;
        s.birdY += s.velocity * dt;

        s.pipes.forEach(p => { p.x -= PIPE_SPEED * dt; });
        if (s.pipes.length && s.pipes[0].x < -PIPE_WIDTH) s.pipes.shift();
        if (s.pipes.length && s.pipes[s.pipes.length - 1].x < WIDTH - 170) {
          const last = s.pipes[s.pipes.length - 1];
          const gapY = 150 + Math.random() * 250;
          s.pipes.push({ x: last.x + 190, gapY, passed: false });
        }

        for (const p of s.pipes) {
          if (!p.passed && p.x + PIPE_WIDTH < BIRD_X) {
            p.passed = true; s.score += 1; setScore(s.score);
          }
          const hitX = BIRD_X + 12 > p.x && BIRD_X - 12 < p.x + PIPE_WIDTH;
          const hitY = s.birdY - 12 < p.gapY - GAP/2 || s.birdY + 12 > p.gapY + GAP/2;
          if (hitX && hitY) endGame();
        }
        if (s.birdY - BIRD_SIZE/2 < 0 || s.birdY + BIRD_SIZE/2 > HEIGHT - 22) endGame();
      }
      draw();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [loading, endGame]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); flap(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading || !profile) return <main style={page}><p>Carregando jogador...</p></main>;

  const progress = (profile.xp / 5) * 100;

  return (
    <main style={page}>
      <section style={header}>
        <div>
          <h1 style={{ margin: 0 }}>🐦 Flappy Level</h1>
          <small>{profile.email}</small>
        </div>
        <button onClick={logout} style={logoutStyle}>Sair</button>
      </section>

      <section style={stats}>
        <div><b>Nível {profile.level}</b><span>Progresso</span><div style={bar}><i style={{ width: `${progress}%` }} /></div></div>
        <div><b>{profile.best_score}</b><span>Recorde</span></div>
        <div><b>{score}</b><span>Partida</span></div>
      </section>

      <div style={gameWrap}>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} onPointerDown={flap} style={canvasStyle} />
      </div>
      <p style={hint}>Toque na tela ou pressione <b>ESPAÇO</b> para bater as asas.</p>
      <p style={levelInfo}>A cada 5 pontos de recorde você sobe 1 nível. Seu nível fica salvo no Supabase.</p>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: '100vh', background: '#f8fafc', padding: 20, boxSizing: 'border-box', color: '#0f172a' };
const header: React.CSSProperties = { maxWidth: 760, margin: '0 auto 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const logoutStyle: React.CSSProperties = { border: 0, background: '#e2e8f0', padding: '9px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 700 };
const stats: React.CSSProperties = { maxWidth: 760, margin: '0 auto 16px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 };
const bar: React.CSSProperties = { height: 7, background: '#e2e8f0', borderRadius: 99, marginTop: 7, overflow: 'hidden' };
const gameWrap: React.CSSProperties = { display: 'flex', justifyContent: 'center' };
const canvasStyle: React.CSSProperties = { width: 'min(360px, 94vw)', height: 'auto', borderRadius: 18, boxShadow: '0 18px 50px rgba(15,23,42,.18)', touchAction: 'none', cursor: 'pointer' };
const hint: React.CSSProperties = { textAlign: 'center', color: '#475569', margin: '14px 0 6px' };
const levelInfo: React.CSSProperties = { textAlign: 'center', color: '#64748b', fontSize: 13 };
