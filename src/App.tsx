import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { Transaction, Category, Budget, UserProfile, TransactionType } from './types';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Trash2, 
  LogOut, 
  Wallet,
  PieChart as PieChartIcon,
  Calendar,
  Settings,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  X,
  Menu,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  Sparkles,
  Bot,
  Brain,
  Palette,
  Check,
  MessageSquare,
  Zap,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import Markdown from 'react-markdown';
import { getFinancialAdvice, suggestCategories } from './services/aiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from './lib/utils';

// --- Components ---

const CustomDropdown = ({ value, onChange, options, label, className }: { value: any, onChange: (val: any) => void, options: { label: string, value: any }[], label?: string, className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 min-w-[120px]"
      >
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 flex-1 text-left truncate">
          {selectedOption?.label || label}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-full min-w-[160px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm transition-colors",
                    value === opt.value 
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Auth = ({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearState = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              display_name: email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        
        if (data.session) {
          // Logged in
        } else {
          setError('Cadastro realizado! Por favor, tente fazer login.');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setError('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] dark:bg-gray-950 p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl dark:shadow-none p-6 md:p-8 border dark:border-gray-800 transition-colors duration-300"
      >
        <div className="text-center mb-8 relative">
          <button
            onClick={toggleTheme}
            className="absolute -top-2 -right-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200 dark:shadow-none">
            <Wallet className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">FinTrack Pro</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {mode === 'login' ? 'Bem-vindo de volta!' : 
             mode === 'signup' ? 'Crie sua conta gratuita.' : 
             'Recupere sua senha.'}
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className={cn(
              "p-3 text-sm rounded-xl border",
              error.includes('enviado') || error.includes('realizado') 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30" 
                : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
            )}>
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
              placeholder="seu@email.com"
            />
          </div>
          
          {mode !== 'forgot' && (
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all pr-12 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1"
            >
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Confirmar Senha</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                placeholder="••••••••"
              />
            </motion.div>
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </div>
            ) : (mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Cadastrar' : 'Enviar E-mail')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode !== 'login' && (
            <button
              onClick={() => { setMode('login'); clearState(); }}
              className="block w-full text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Voltar para o Login
            </button>
          )}
          {mode === 'login' && (
            <button
              onClick={() => { setMode('signup'); clearState(); }}
              className="block w-full text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Não tem uma conta? Cadastre-se
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, onLogout, user, theme, toggleTheme }: any) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: ArrowUpCircle },
    { id: 'budgets', label: 'Orçamentos', icon: Calendar },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-screen sticky top-0 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 dark:shadow-none">
          <Wallet className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl text-gray-900 dark:text-white">FinTrack</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === item.id 
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 mb-2"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
        </button>

        <div className="flex items-center gap-3 p-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </div>
  );
};

const FinAI = ({ transactions, budgets, categories, monthName, isOpen, onClose }: { transactions: Transaction[], budgets: Budget[], categories: Category[], monthName: string, isOpen: boolean, onClose: () => void }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(transactions, budgets, categories, monthName);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col border-l dark:border-gray-800"
          >
            {/* Header */}
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between bg-emerald-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">FinAI Assistente</h3>
                  <p className="text-emerald-100 text-[10px] uppercase tracking-widest font-bold">Inteligência Financeira</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-emerald-500/10 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">Analisando {monthName}...</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto">
                        Estou processando suas {transactions.length} transações para gerar insights precisos.
                      </p>
                    </div>
                  </motion.div>
                ) : advice ? (
                  <motion.div 
                    key="advice"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex items-start gap-3">
                      <Zap className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                        Este relatório foi gerado com base no seu histórico de <strong>{monthName}</strong>. Use estas dicas para otimizar seu orçamento.
                      </p>
                    </div>
                    
                    <div className="markdown-body prose dark:prose-invert max-w-none">
                      <Markdown>{advice}</Markdown>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-8 py-10"
                  >
                    <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">Relatório de {monthName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                        Clique no botão abaixo para gerar uma análise completa dos seus gastos e orçamentos deste mês.
                      </p>
                    </div>
                    
                    <div className="w-full grid grid-cols-2 gap-3 text-left">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
                        <p className="text-[10px] uppercase font-bold text-gray-400">Insights</p>
                        <p className="text-xs font-bold dark:text-white">Padrões de Gastos</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <Wallet className="w-5 h-5 text-emerald-500 mb-2" />
                        <p className="text-[10px] uppercase font-bold text-gray-400">Economia</p>
                        <p className="text-xs font-bold dark:text-white">Dicas Práticas</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <button
                onClick={handleGetAdvice}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {loading ? 'Processando Dados...' : advice ? 'Atualizar Relatório' : 'Gerar Análise de ' + monthName}
              </button>
              {advice && (
                <button 
                  onClick={() => setAdvice(null)}
                  className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Limpar Relatório
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const CategoryManager = ({ categories, onAdd, onDelete }: { categories: Category[], onAdd: (data: any) => void, onDelete: (id: string) => void }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState('#10b981');
  const [icon, setIcon] = useState('wallet');

  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', 
    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAdd({ name, type, color, icon });
    setName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciar Categorias</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl space-y-4 border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nome da Categoria</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    placeholder="Ex: Assinaturas, Pets..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tipo</label>
                  <div className="flex p-1 bg-white dark:bg-gray-900 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                        type === 'expense' ? "bg-red-50 text-red-600" : "text-gray-500"
                      )}
                    >
                      Despesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                        type === 'income' ? "bg-emerald-50 text-emerald-600" : "text-gray-500"
                      )}
                    >
                      Receita
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all flex items-center justify-center",
                        color === c ? "ring-2 ring-offset-2 ring-emerald-500 scale-110" : ""
                      )}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all"
              >
                Criar Categoria
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{cat.name}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{cat.type === 'income' ? 'Receita' : 'Despesa'}</p>
              </div>
            </div>
            <button
              onClick={() => onDelete(cat.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = ({ transactions, categories, budgets }: { transactions: Transaction[], categories: Category[], budgets: Budget[] }) => {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: 'Entradas', value: totalIncome, color: '#10b981' },
    { name: 'Saídas', value: totalExpense, color: '#ef4444' },
  ];

  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: transactions.filter(t => t.category === cat.name).reduce((acc, t) => acc + t.amount, 0),
    color: cat.color
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <TrendingUp className="text-emerald-500 dark:text-emerald-400 w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">MENSAL</span>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Entradas</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalIncome)}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
              <TrendingDown className="text-red-500 dark:text-red-400 w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">MENSAL</span>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Saídas</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpense)}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 dark:bg-emerald-600 p-6 rounded-3xl shadow-sm transition-colors duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Wallet className="text-white w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-400 dark:text-emerald-100">Saldo Atual</p>
          <h3 className="text-2xl font-bold text-white">{formatCurrency(balance)}</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Visão Geral</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-gray-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb', opacity: 0.1 }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#1f2937',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Gastos por Categoria</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#1f2937',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionList = ({ transactions, onDelete, onClear }: { transactions: Transaction[], onDelete: (id: string) => void, onClear: () => void }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white">Últimas Transações</h3>
        {transactions.length > 0 && (
          <button 
            onClick={onClear}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Filtro
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Data</th>
              <th className="px-6 py-4 font-semibold">Descrição</th>
              <th className="px-6 py-4 font-semibold">Categoria</th>
              <th className="px-6 py-4 font-semibold">Valor</th>
              <th className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {format(parseISO(t.date), 'dd MMM, yyyy', { locale: ptBR })}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{t.description}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {t.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "text-sm font-bold",
                    t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ClearConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void,
  title: string,
  description: string
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border dark:border-gray-800"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {description}
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-200 dark:shadow-none"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const TransactionModal = ({ isOpen, onClose, onAdd, categories }: any) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;
    
    onAdd({
      type,
      amount: parseFloat(amount),
      description,
      category,
      date: new Date(date).toISOString(),
    });
    
    // Reset
    setAmount('');
    setDescription('');
    setCategory('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nova Transação</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                    type === 'expense' ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm" : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                    type === 'income' ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  Receita
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Valor</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-xl dark:text-white"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Descrição</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 dark:text-white pr-12"
                    placeholder="Ex: Supermercado, Salário..."
                  />
                  {description.length > 3 && (
                    <button
                      type="button"
                      onClick={async () => {
                        const suggestion = await suggestCategories(description);
                        if (suggestion) {
                          const existingCat = categories.find(c => 
                            c.name.toLowerCase().includes(suggestion.toLowerCase()) || 
                            suggestion.toLowerCase().includes(c.name.toLowerCase())
                          );
                          if (existingCat) setCategory(existingCat.name);
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                      title="Sugerir categoria com IA"
                    >
                      <Sparkles className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Categoria</label>
                  <CustomDropdown
                    value={category}
                    onChange={setCategory}
                    options={categories.filter((c: any) => c.type === type).map((cat: any) => ({
                      label: cat.name,
                      value: cat.name
                    }))}
                    label="Selecione"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 transition-all active:scale-[0.98]"
              >
                Adicionar Transação
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearMode, setClearMode] = useState<'filtered' | 'all' | 'single'>('filtered');
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('uid', user.id)
        .order('date', { ascending: false });
      
      if (!error && data) setTransactions(data);
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('uid', user.id);
      
      if (!error && data) {
        if (data.length === 0) {
          const defaults = [
            { name: 'Alimentação', type: 'expense', color: '#ef4444', icon: 'utensils', uid: user.id },
            { name: 'Transporte', type: 'expense', color: '#f59e0b', icon: 'car', uid: user.id },
            { name: 'Lazer', type: 'expense', color: '#8b5cf6', icon: 'gamepad', uid: user.id },
            { name: 'Salário', type: 'income', color: '#10b981', icon: 'banknote', uid: user.id },
            { name: 'Investimentos', type: 'income', color: '#3b82f6', icon: 'trending-up', uid: user.id },
          ];
          const { data: inserted } = await supabase.from('categories').insert(defaults).select();
          if (inserted) setCategories(inserted);
        } else {
          setCategories(data);
        }
      }
    };

    const fetchBudgets = async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('uid', user.id);
      
      if (!error && data) setBudgets(data);
    };

    fetchTransactions();
    fetchCategories();
    fetchBudgets();

    // Set up real-time subscriptions
    const transSubscription = supabase
      .channel('transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `uid=eq.${user.id}` }, fetchTransactions)
      .subscribe();

    const catSubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `uid=eq.${user.id}` }, fetchCategories)
      .subscribe();

    const budgetSubscription = supabase
      .channel('budgets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `uid=eq.${user.id}` }, fetchBudgets)
      .subscribe();

    return () => {
      transSubscription.unsubscribe();
      catSubscription.unsubscribe();
      budgetSubscription.unsubscribe();
    };
  }, [user]);

  const handleAddTransaction = async (data: any) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('transactions').insert([{
        ...data,
        uid: user.id,
        createdAt: new Date().toISOString()
      }]);
      if (error) throw error;
      
      // Manual fetch to ensure UI updates immediately if real-time is slow
      const { data: freshData } = await supabase
        .from('transactions')
        .select('*')
        .eq('uid', user.id)
        .order('date', { ascending: false });
      
      if (freshData) setTransactions(freshData);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await supabase.from('transactions').delete().eq('id', id);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleClearTransactions = async () => {
    if (!user) return;
    
    try {
      let query = supabase.from('transactions').delete().eq('uid', user.id);
      
      if (clearMode === 'filtered') {
        const start = startOfMonth(new Date(selectedYear, selectedMonth));
        const end = endOfMonth(new Date(selectedYear, selectedMonth));
        query = query
          .gte('date', start.toISOString())
          .lte('date', end.toISOString());
      } else if (clearMode === 'single' && transactionToDelete) {
        query = query.eq('id', transactionToDelete.id);
      }
      
      const { error } = await query;
      if (error) throw error;
      
      // Refresh
      const { data: freshData } = await supabase
        .from('transactions')
        .select('*')
        .eq('uid', user.id)
        .order('date', { ascending: false });
      
      if (freshData) setTransactions(freshData);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error clearing transactions:', error);
    }
  };

  const handleAddBudget = async (data: any) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('budgets').upsert([{
        ...data,
        uid: user.id,
        month: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`
      }]);
      if (error) throw error;
    } catch (error) {
      console.error("Error adding budget:", error);
    }
  };

  const handleAddCategory = async (data: any) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('categories').insert([{
        ...data,
        uid: user.id
      }]);
      if (error) throw error;
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleLogout = () => supabase.auth.signOut();

  const filteredTransactions = transactions.filter(t => {
    const d = parseISO(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const currentMonthBudgets = budgets.filter(b => b.month === `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] dark:bg-gray-950 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-gray-950 flex transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        user={user} 
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <FinAI 
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
        transactions={filteredTransactions}
        budgets={currentMonthBudgets}
        categories={categories}
        monthName={format(new Date(selectedYear, selectedMonth, 1), 'MMMM yyyy', { locale: ptBR })}
      />

      {/* AI Floating Button */}
      <button
        onClick={() => setIsAiPanelOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-90 group"
      >
        <div className="absolute -top-2 -right-2 bg-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full animate-bounce shadow-sm">IA</div>
        <Bot className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Wallet className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">FinTrack</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800"
            >
              {theme === 'light' ? <Moon className="w-5 h-5 text-gray-900 dark:text-white" /> : <Sun className="w-5 h-5 text-gray-900 dark:text-white" />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800"
            >
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'transactions' ? 'Transações' : 
                 activeTab === 'budgets' ? 'Orçamentos' : 'Configurações'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Bem-vindo de volta!</p>
            </div>
            
            <div className="flex items-center gap-2 md:ml-4">
              <CustomDropdown 
                value={selectedMonth}
                onChange={setSelectedMonth}
                options={Array.from({ length: 12 }).map((_, i) => ({
                  label: format(new Date(2000, i, 1), 'MMMM', { locale: ptBR }),
                  value: i
                }))}
              />
              <CustomDropdown 
                value={selectedYear}
                onChange={setSelectedYear}
                options={Array.from({ length: 5 }).map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return { label: year.toString(), value: year };
                })}
              />
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Nova Transação
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard transactions={filteredTransactions} categories={categories} budgets={budgets} />
            )}
            {activeTab === 'transactions' && (
              <TransactionList 
                transactions={filteredTransactions} 
                onDelete={(id) => {
                  const trans = transactions.find(t => t.id === id);
                  if (trans) {
                    setTransactionToDelete(trans);
                    setClearMode('single');
                    setIsClearModalOpen(true);
                  }
                }} 
                onClear={() => {
                  setClearMode('filtered');
                  setIsClearModalOpen(true);
                }}
              />
            )}
            {activeTab === 'budgets' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.filter(c => c.type === 'expense').map(cat => {
                    const budget = currentMonthBudgets.find(b => b.category === cat.name);
                    const spent = filteredTransactions
                      .filter(t => t.category === cat.name && t.type === 'expense')
                      .reduce((acc, t) => acc + t.amount, 0);
                    const progress = budget ? (spent / budget.amount) * 100 : 0;
                    
                    return (
                      <div key={cat.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                              <Wallet className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{cat.name}</h4>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Gasto: {formatCurrency(spent)}</span>
                            <span className="font-bold text-gray-900 dark:text-white">Meta: {budget ? formatCurrency(budget.amount) : 'N/A'}</span>
                          </div>
                          
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(progress, 100)}%` }}
                              className={cn(
                                "h-full rounded-full transition-all",
                                progress > 100 ? "bg-red-500" : "bg-emerald-500"
                              )}
                            />
                          </div>
                          
                          <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Definir Orçamento</label>
                            <div className="flex gap-2">
                              <input 
                                type="number"
                                placeholder="Valor"
                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddBudget({ category: cat.name, amount: parseFloat((e.target as HTMLInputElement).value) });
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="space-y-8 max-w-4xl">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Configurações do Perfil</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{user.email?.split('@')[0]}</p>
                        <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                  <CategoryManager 
                    categories={categories} 
                    onAdd={handleAddCategory} 
                    onDelete={handleDeleteCategory} 
                  />
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                  <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-4">Zona de Perigo</h4>
                  <button
                    onClick={() => {
                      setClearMode('all');
                      setIsClearModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-2xl border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                    Limpar Todas as Transações
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <TransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddTransaction}
          categories={categories}
        />

        <ClearConfirmationModal
          isOpen={isClearModalOpen}
          onClose={() => {
            setIsClearModalOpen(false);
            setTransactionToDelete(null);
          }}
          onConfirm={handleClearTransactions}
          title={
            clearMode === 'all' ? "Limpar Tudo?" : 
            clearMode === 'filtered' ? "Limpar Filtro?" : 
            "Excluir Transação?"
          }
          description={
            clearMode === 'all' 
              ? "Esta ação excluirá permanentemente TODAS as suas transações. Esta operação não pode ser desfeita."
              : clearMode === 'filtered'
              ? `Esta ação excluirá permanentemente todas as transações de ${format(new Date(selectedYear, selectedMonth), 'MMMM yyyy', { locale: ptBR })}. Esta operação não pode ser desfeita.`
              : `Deseja realmente excluir a transação "${transactionToDelete?.description}"? Esta ação não pode ser desfeita.`
          }
        />
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 z-50 md:hidden p-6 flex flex-col transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Wallet className="text-white w-6 h-6" />
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">FinTrack</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {['dashboard', 'transactions', 'budgets', 'settings'].map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      activeTab === id 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold" 
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {id === 'dashboard' && <LayoutDashboard className="w-5 h-5" />}
                    {id === 'transactions' && <ArrowUpCircle className="w-5 h-5" />}
                    {id === 'budgets' && <Calendar className="w-5 h-5" />}
                    {id === 'settings' && <Settings className="w-5 h-5" />}
                    {id === 'dashboard' ? 'Dashboard' : id === 'transactions' ? 'Transações' : id === 'budgets' ? 'Orçamentos' : 'Configurações'}
                  </button>
                ))}
              </nav>
              <button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
