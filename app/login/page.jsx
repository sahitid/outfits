'use client';
import { useState } from 'react';
export default function Login() {
  const [mode,setMode] = useState('login'), [email,setEmail] = useState(''), [password,setPassword] = useState(''), [busy,setBusy] = useState(false), [message,setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/auth/'+mode,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      if (result.confirmation) setMessage('Check your email to confirm your account, then return here to sign in.');
      else location.assign('/');
    } catch (error) { setMessage(error.message || 'Please try again.'); } finally { setBusy(false); }
  }
  return <main className="login-shell"><section className="login-card"><a className="wordmark" href="/">outfits<span className="wordmark-dot">.</span></a><p className="eyebrow">YOUR CLOSET, JUST FOR YOU</p><h1>{mode==='signup'?'Make yourself at home.':'Welcome back.'}</h1><p className="subtle">Your favorite pieces. Your next great outfit.<br/>Sign in to your private wardrobe.</p><form onSubmit={submit}><label className="field">Email<input className="input" autoComplete="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="field">Password<input className="input" autoComplete={mode==='signup'?'new-password':'current-password'} type="password" minLength={12} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)}/></label>{mode==='signup'&&<p className="subtle">Choose a password with at least 12 characters. Registration is restricted to the closet owner.</p>}<button className="btn btn-primary" disabled={busy}>{busy?'One moment…':mode==='signup'?'Create my account':'Open my closet'}</button><p role="status" className="subtle">{message}</p></form><button className="link" onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('');}}>{mode==='login'?'First visit? Create your account':'Already have an account? Sign in'}</button><p className="login-note">Your photos and outfits are private and only available after you sign in.</p></section></main>;
}
