import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      
      if (response.success) {
        const role = response.data.user.role;
        if (role === 'student') {
          navigate('/student/dashboard');
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/recruiter/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg float">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-display font-bold text-gradient">CampusGrid</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-display font-bold text-gray-900 leading-tight">
              Welcome Back to Your Learning Journey
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Continue mastering your skills with smart assessments and gamified progress tracking.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Track Your Progress</h3>
                <p className="text-sm text-gray-600">Earn badges, stars, and prestige as you learn</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Multi-Language Support</h3>
                <p className="text-sm text-gray-600">Code in JavaScript, Python, Java, and C++</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="animate-slide-up">
          <div className="card-elevated p-8 md:p-10 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">Student Portal</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Enter your credentials to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-scale-in">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-800 font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="input-group">
                  <Mail className="icon w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-premium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="input-group">
                  <Lock className="icon w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-premium pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Student Registration
                </Link>
              </p>
              
              <p className="text-center text-sm text-gray-500 mt-2">
                Hiring for your company?{' '}
                <Link to="/recruiter/register" className="text-accent-600 hover:text-accent-700 font-semibold">
                  Recruiter Registration
                </Link>
              </p>
            </div>
          </div>

          {/* Mobile Branding */}
          <div className="lg:hidden mt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-gradient">CampusGrid</span>
            </div>
            <p className="text-gray-600">The future of college assessments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
