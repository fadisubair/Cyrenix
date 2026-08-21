import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import { login } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const data = await login(username, password);
      if (data && data.access_token) {
        await authLogin(data.access_token);
        navigate('/');
      } else {
        setError('Invalid response from server.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials or network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-brand/10 p-4 rounded-full mb-4">
            <Shield size={48} className="text-brand" />
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-slate-100">CYRENIX</h1>
          <p className="text-slate-500 font-mono text-sm tracking-widest mt-2 uppercase">SOC Console Authentication</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-8">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand hover:bg-blue-600 text-white font-medium py-3 rounded transition-colors flex items-center justify-center gap-2"
            >
              <Lock size={18} />
              {isSubmitting ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
