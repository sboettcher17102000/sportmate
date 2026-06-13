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
          className={`w-2 h-2 rounded-full transition-colors ${s === step ? 'bg-purple-600' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-700 to-blue-600">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">SportMate</h1>
            <p className="text-purple-200 text-sm mt-1">Dein Hochschulsport-Begleiter</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            {dots}

            {/* ── Schritt 1 ── */}
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">Konto erstellen</h2>
                <p className="text-xs text-gray-400 mb-5">Schritt 1 von 3</p>
                <form onSubmit={handleStep1} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Max Mustermann"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="max@hs-heilbronn.de"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Mindestens 6 Zeichen"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl py-3 text-sm hover:opacity-90 transition"
                  >
                    Weiter →
                  </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Bereits ein Konto?{' '}
                  <Link to="/login" className="text-purple-600 font-medium hover:underline">
                    Anmelden
                  </Link>
                </p>
              </>
            )}

            {/* ── Schritt 2 ── */}
            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">Profil vervollständigen</h2>
                <p className="text-xs text-gray-400 mb-5">Schritt 2 von 3 · Alle Felder optional</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Universität / Hochschule</label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="z.B. Hochschule Heilbronn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Studiengang</label>
                    <input
                      type="text"
                      value={studiengang}
                      onChange={(e) => setStudiengang(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="z.B. Wirtschaftsinformatik"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="z.B. 3"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    onClick={() => handleRegister(false)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl py-3 text-sm hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? 'Wird registriert…' : 'Registrieren'}
                  </button>
                  <button
                    onClick={() => handleRegister(true)}
                    disabled={loading}
                    className="w-full border border-gray-300 text-gray-500 rounded-xl py-3 text-sm hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Überspringen
                  </button>
                </div>
              </>
            )}

            {/* ── Schritt 3 ── */}
            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">Freunde einladen</h2>
                <p className="text-xs text-gray-400 mb-5">Schritt 3 von 3</p>

                {/* Link teilen */}
                <button
                  onClick={handleCopyLink}
                  className="w-full mb-4 flex items-center justify-center gap-2 border border-purple-300 text-purple-600 rounded-xl py-2.5 text-sm font-medium hover:bg-purple-50 transition"
                >
                  {linkCopied ? '✓ Link kopiert!' : '🔗 Einladungslink kopieren'}
                </button>

                <div className="relative mb-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-gray-400">oder nach Name / E-Mail suchen</span>
                  </div>
                </div>

                {/* Suche */}
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                  placeholder="Name oder E-Mail…"
                />

                {results.length > 0 && (
                  <ul className="space-y-2 mb-4 max-h-52 overflow-y-auto">
                    {results.map((u) => (
                      <li key={u.id} className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-purple-600 text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                          {initials(u.name)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        <button
                          onClick={() => handleSendRequest(u.id)}
                          disabled={sent.has(u.id)}
                          className={`flex-shrink-0 text-xs font-medium rounded-full px-3 py-1 transition ${
                            sent.has(u.id)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}
                        >
                          {sent.has(u.id) ? '✓ Gesendet' : 'Anfrage senden'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl py-3 text-sm hover:opacity-90 transition"
                >
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
