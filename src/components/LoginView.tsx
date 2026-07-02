import React, { useState } from 'react';
import { Lock, Factory, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { store } from '../lib/store';
import { motion } from 'motion/react';

export function LoginView({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (store.login(password)) {
      onLogin();
    } else {
      setError('Noto\'g\'ri parol. Iltimos, qaytadan urinib ko\'ring.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-emerald-600 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Factory className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">NormaAI</h1>
          <p className="text-emerald-100 text-sm font-medium mt-1">Ishlab chiqarish nazorat tizimi</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                Tizimga kirish paroli
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Parolni kiriting"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-bold"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-xs font-bold mt-2 px-1 animate-pulse">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              KIRISH
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
              Dastlabki parol: <span className="text-emerald-600">123456</span><br/>
              Kirgandan so'ng parolni o'zgartirishingiz mumkin
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
