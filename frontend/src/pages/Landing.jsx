import { Link } from 'react-router-dom';
import { 
  Zap, Shield, Trophy, TrendingUp, Code, CheckCircle, 
  ArrowRight, Star, Sparkles, Target, Award, Users 
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Execute code in milliseconds with our optimized engine'
    },
    {
      icon: Shield,
      title: 'Ultra Secure',
      description: '9-layer security monitoring for fair assessments'
    },
    {
      icon: Trophy,
      title: 'Gamified Learning',
      description: 'Earn badges, stars, and prestige as you progress'
    },
    {
      icon: Code,
      title: 'Multi-Language',
      description: 'JavaScript, Python, Java, C++ - all supported'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Visual analytics and detailed performance insights'
    },
    {
      icon: Target,
      title: 'Adaptive Levels',
      description: 'From beginner to master - grow at your pace'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Students' },
    { value: '500+', label: 'Questions' },
    { value: '50+', label: 'Subjects' },
    { value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-gradient">CampusGrid</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <button className="btn-secondary text-sm">Sign In</button>
              </Link>
              <Link to="/register">
                <button className="btn-primary text-sm">Get Started</button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft mb-8 animate-scale-in">
              <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
              <span className="text-sm font-semibold text-gray-700">Trusted by 10,000+ Students</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 mb-6 animate-fade-in">
              Master Your Skills with
              <span className="block text-gradient mt-2">Smart Assessments</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-slide-up">
              The most advanced exam platform for colleges. Take tests, earn badges, 
              track progress, and level up your learning journey.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/register">
                <button className="btn-primary text-lg px-8 py-4 flex items-center gap-2 shadow-glow-lg">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/login">
                <button className="btn-secondary text-lg px-8 py-4">
                  Sign In
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Mockup */}
          <div className="mt-20 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative card p-8 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Trophy className="w-24 h-24 text-primary-600 mx-auto mb-4" />
                    <p className="text-2xl font-display font-bold text-gray-700">Dashboard Preview</p>
                    <p className="text-gray-500 mt-2">Beautiful, intuitive, powerful</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make learning engaging and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card-hover p-8 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of students already leveling up
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your email in seconds' },
              { step: '02', title: 'Choose Subject', desc: 'Pick from 50+ subjects and start learning' },
              { step: '03', title: 'Earn Rewards', desc: 'Complete exams, earn badges, track progress' }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="card p-8 text-center">
                  <div className="text-6xl font-display font-bold text-gradient mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.desc}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-primary-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600"></div>
            <div className="relative p-12 md:p-16 text-center">
              <Sparkles className="w-16 h-16 text-white mx-auto mb-6 animate-bounce-subtle" />
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join 10,000+ students who are already mastering their skills with CampusGrid
              </p>
              <Link to="/register">
                <button className="bg-white text-primary-600 px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-2xl">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-bold">CampusGrid</span>
              </div>
              <p className="text-gray-400">
                The future of college assessments
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white">Features</Link></li>
                <li><Link to="/login" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/login" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white">About</Link></li>
                <li><Link to="/login" className="hover:text-white">Blog</Link></li>
                <li><Link to="/login" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/login" className="hover:text-white">Contact</Link></li>
                <li><Link to="/login" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 CampusGrid. Built with ❤️ for LJ University</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
