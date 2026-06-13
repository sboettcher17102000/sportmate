import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/auth';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await registerApi(name, email, password);
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-700 to-blue-600">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">SportMate</h1>
            <p className="text-purple-200 text-sm mt-1">Dein Hochschulsport-Begleiter</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Konto erstellen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl py-3 text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Wird registriert…' : 'Registrieren'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Bereits ein Konto?{' '}
              <Link to="/login" className="text-purple-600 font-medium hover:underline">
                Anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
