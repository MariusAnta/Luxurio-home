import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserAuth } from '../lib/userAuth';

interface Props { open: boolean; onClose: () => void; }

export function AuthModal({ open, onClose }: Props) {
  const { login, register } = useUserAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'register' && password !== confirm) {
      setErr(t('auth.passwordMismatch'));
      return;
    }
    setErr(''); setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, name || undefined);
      onClose();
      setEmail(''); setPassword(''); setConfirm(''); setName('');
    } catch (e: any) {
      setErr(e?.response?.data?.error || t('auth.genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>
          {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
        </p>
        <h2>{mode === 'login' ? t('auth.signIn') : t('auth.register')}</h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--fg2)', marginBottom: 32, marginTop: 8 }}>
          {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
        </p>
        <form onSubmit={onSubmit}>
          {mode === 'register' && (
            <div className="field">
              <label>{t('auth.name')}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.namePlaceholder')} />
            </div>
          )}
          <div className="field">
            <label>{t('auth.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>{t('auth.password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          {mode === 'register' && (
            <div className="field">
              <label>{t('auth.confirmPassword')}</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} placeholder={t('auth.confirmPlaceholder')} />
            </div>
          )}
          {err && <p style={{ color: '#c97070', fontSize: 12, marginBottom: 16 }}>{err}</p>}
          <button className="btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? '…' : mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
          </button>
        </form>
        <p style={{ marginTop: 24, fontSize: 12, color: 'var(--fg3)', textAlign: 'center' }}>
          {mode === 'login' ? t('auth.newCustomer') : t('auth.alreadyMember')}{' '}
          <a onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); setConfirm(''); }}
            style={{ color: 'var(--gold)', cursor: 'pointer', borderBottom: '1px solid var(--gold2)' }}>
            {mode === 'login' ? t('auth.createOne') : t('auth.signInLink')}
          </a>
        </p>
      </div>
    </div>
  );
}
