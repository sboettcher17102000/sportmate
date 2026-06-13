import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/auth';
import { searchUsers, sendFriendRequest } from '../api/friendships';
import { initials } from '../components/ui/eventHelpers';
import type { User } from '../types';

type Step = 1 | 2 | 3;

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);

  // Schritt 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Schritt 2
  const [university, setUniversity] = useState('');
  const [studiengang, setStudiengang] = useState('');
  const [semester, setSemester] = useState('');

  // Schritt 3
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [linkCopied, setLinkCopied] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Suche debounced
  useEffect(() => {
    if (step !== 3 || query.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      searchUsers(query).then(setResults).catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [query, step]);

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setStep(2);
  }

  async function handleRegister(skip = false) {
    setError('');
    setLoading(true);
    try {
      const opts = skip ? undefined : {
        university: university.trim() || undefined,
        studiengang: studiengang.trim() || undefined,
        semester: semester ? Number(semester) : undefined,
      };
      const { token, user } = await registerApi(name, email, password, opts);
      login(token, user);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRequest(userId: number) {
    try {
      await sendFriendRequest(userId);
      setSent((prev) => new Set(prev).add(userId));
    } catch {
      // already sent or other error — silently ignore
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.origin + '/register');
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const dots = (
    <div className="flex justify-center gap-2 mb-6">
      {([1, 2, 3] as Step[]).map((s) => (
        <span
          key={s}
          className={`h-2.5 rounded-full border-2 border-ink transition-all ${s === step ? 'w-6 bg-violet' : 'w-2.5 bg-white'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="logo-mark w-16 h-16 rounded-[20px] mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-ink">
                <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
              </svg>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-ink">SportMate</h1>
            <p className="font-bold text-ink-2 text-sm mt-1">Dein Hochschulsport-Begleiter</p>
          </div>

          <div className="card-pop p-6">
            {dots}

            {/* ── Schritt 1 ── */}
            {step === 1 && (
              <>
                <h2 className="font-display text-2xl font-extrabold text-ink mb-1">Konto erstellen</h2>
                <p className="text-xs font-bold text-ink-2 mb-5">Schritt 1 von 3</p>
                <form onSubmit={handleStep1} className="space-y-4">
                  <div>
                    <label className="block font-display text-xs font-extrabold text-ink mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-pop"
                      placeholder="Max Mustermann"
                    />
                  </div>
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
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-pop"
                      placeholder="Mindestens 6 Zeichen"
                    />
                  </div>
                  <button type="submit" className="btn-pop btn-violet">
                    Weiter →
                  </button>
                </form>
                <p className="text-center text-sm font-bold text-ink-2 mt-4">
                  Bereits ein Konto?{' '}
                  <Link to="/login" className="text-violet font-extrabold hover:underline">
                    Anmelden
                  </Link>
                </p>
              </>
            )}

            {/* ── Schritt 2 ── */}
            {step === 2 && (
              <>
                <h2 className="font-display text-2xl font-extrabold text-ink mb-1">Profil vervollständigen</h2>
                <p className="text-xs font-bold text-ink-2 mb-5">Schritt 2 von 3 · Alle Felder optional</p>
                <div className="space-y-4">
                  <div>
                    <label className="block font-display text-xs font-extrabold text-ink mb-1.5">Universität / Hochschule</label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="input-pop"
                      placeholder="z.B. Hochschule Heilbronn"
                    />
                  </div>
                  <div>
                    <label className="block font-display text-xs font-extrabold text-ink mb-1.5">Studiengang</label>
                    <input
                      type="text"
                      value={studiengang}
                      onChange={(e) => setStudiengang(e.target.value)}
                      className="input-pop"
                      placeholder="z.B. Wirtschaftsinformatik"
                    />
                  </div>
                  <div>
                    <label className="block font-display text-xs font-extrabold text-ink mb-1.5">Semester</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="input-pop"
                      placeholder="z.B. 3"
                    />
                  </div>
                  {error && <p className="text-coral font-bold text-sm">{error}</p>}
                  <button
                    onClick={() => handleRegister(false)}
                    disabled={loading}
                    className="btn-pop btn-violet"
                  >
                    {loading ? 'Wird registriert…' : 'Registrieren'}
                  </button>
                  <button
                    onClick={() => handleRegister(true)}
                    disabled={loading}
                    className="btn-pop btn-white"
                  >
                    Überspringen
                  </button>
                </div>
              </>
            )}

            {/* ── Schritt 3 ── */}
            {step === 3 && (
              <>
                <h2 className="font-display text-2xl font-extrabold text-ink mb-1">Freunde einladen</h2>
                <p className="text-xs font-bold text-ink-2 mb-5">Schritt 3 von 3</p>

                {/* Link teilen */}
                <button onClick={handleCopyLink} className="btn-pop btn-yellow mb-4">
                  {linkCopied ? '✓ Link kopiert!' : '🔗 Einladungslink kopieren'}
                </button>

                <div className="relative mb-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-ink/15" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs font-bold text-ink-2">oder nach Name / E-Mail suchen</span>
                  </div>
                </div>

                {/* Suche */}
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-pop mb-3"
                  placeholder="Name oder E-Mail…"
                />

                {results.length > 0 && (
                  <ul className="space-y-2 mb-4 max-h-52 overflow-y-auto">
                    {results.map((u) => (
                      <li key={u.id} className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-violet text-white border-2 border-ink text-[11px] font-extrabold font-display flex items-center justify-center flex-shrink-0">
                          {initials(u.name)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-display font-extrabold text-ink truncate">{u.name}</p>
                          <p className="text-xs font-bold text-ink-2 truncate">{u.email}</p>
                        </div>
                        <button
                          onClick={() => handleSendRequest(u.id)}
                          disabled={sent.has(u.id)}
                          className={`flex-shrink-0 pill ${
                            sent.has(u.id) ? 'bg-mint text-ink' : 'bg-violet text-white'
                          }`}
                        >
                          {sent.has(u.id) ? '✓ Gesendet' : 'Anfrage senden'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <button onClick={() => navigate('/')} className="btn-pop btn-violet">
                  Jetzt starten →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
