import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/auth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await loginApi(email, password);
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'radial-gradient(circle at 25% 8%, #E7E2FF, transparent 45%), radial-gradient(circle at 90% 92%, #DCF1FF, transparent 45%), #EFEDFB',
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="logo-mark w-[70px] h-[70px] rounded-[20px] mb-4" style={{ transform: 'rotate(-7deg)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 text-ink">
                <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
              </svg>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-ink">SportMate</h1>
            <p className="font-bold text-ink-2 text-sm mt-1">Dein Hochschulsport-Begleiter</p>

            <p className="font-display font-extrabold text-[25px] leading-tight text-ink text-center mt-6">
              Alle Sportevents an einem Ort.<br />
              <span className="text-violet">Mit deinen Freunden.</span>
            </p>
            <p className="font-semibold text-ink-2 text-[14px] leading-relaxed text-center mt-2.5 max-w-xs">
              Hochschulsport, Vereine und lokale Events gebündelt. Sieh, wo deine Freunde mitmachen.
            </p>
          </div>

          <div className="card-pop p-6" style={{ boxShadow: '5px 5px 0 #1a1730' }}>
            <h2 className="font-display text-2xl font-extrabold text-ink mb-5">Anmelden</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-display text-xs font-extrabold text-ink mb-1.5">E-Mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-pop"
                  placeholder="max@hs-heilbronn.de"
                />
              </div>
              <div>
                <label className="block font-display text-xs font-extrabold text-ink mb-1.5">Passwort</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-pop"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-coral font-bold text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="btn-pop btn-violet">
                {loading ? 'Wird angemeldet…' : 'Anmelden'}
              </button>
            </form>
            <p className="text-center text-sm font-bold text-ink-2 mt-4">
              Noch kein Konto?{' '}
              <Link to="/register" className="text-violet font-extrabold hover:underline">
                Registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
