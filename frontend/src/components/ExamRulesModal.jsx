import { AlertTriangle, Shield, Eye, Clock, Ban } from 'lucide-react';

export default function ExamRulesModal({ isOpen, onAccept, mode = 'lenient' }) {
  if (!isOpen) return null;

  const rules = [
    {
      icon: Shield,
      title: 'Fullscreen Required',
      description: 'Exam must be taken in fullscreen mode. Exiting fullscreen will be detected.',
      strict: 'Immediate violation',
      lenient: '2-second grace period'
    },
    {
      icon: Eye,
      title: 'No Tab Switching',
      description: 'Switching tabs or windows will be detected and reported.',
      strict: 'Immediate ban',
      lenient: '1 warning, then ban'
    },
    {
      icon: Ban,
      title: 'No Copy/Paste',
      description: 'Copy and paste operations are blocked. Type your answers.',
      strict: 'Blocked',
      lenient: 'Blocked'
    },
    {
      icon: Ban,
      title: 'No Right Click',
      description: 'Right-click context menu is disabled.',
      strict: 'Blocked',
      lenient: 'Blocked'
    },
    {
      icon: AlertTriangle,
      title: 'No DevTools',
      description: 'Browser developer tools (F12, Ctrl+Shift+I) are blocked.',
      strict: 'Blocked',
      lenient: 'Blocked'
    },
    {
      icon: Clock,
      title: 'No Inactivity',
      description: 'Inactivity for more than 5 minutes will be flagged.',
      strict: 'Violation',
      lenient: 'Warning'
    },
    {
      icon: Eye,
      title: 'Mouse Tracking',
      description: 'Moving mouse outside the exam window is monitored.',
      strict: 'Violation',
      lenient: 'Allowed'
    },
    {
      icon: Ban,
      title: 'No Screenshots',
      description: 'Print Screen key is monitored (best effort detection).',
      strict: 'Violation',
      lenient: 'Violation'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-600" />
            Exam Rules & Monitoring
          </h2>
          <p className="text-gray-600 mt-2">
            Please read carefully. Violations will be tracked and may result in exam termination.
          </p>
        </div>

        <div className="p-6">
          {/* Mode Indicator */}
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            mode === 'strict' 
              ? 'bg-red-50 border-red-300' 
              : 'bg-yellow-50 border-yellow-300'
          }`}>
            <h3 className={`font-bold text-lg mb-1 ${
              mode === 'strict' ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {mode === 'strict' ? '🔒 STRICT MODE' : '⚠️ LENIENT MODE'}
            </h3>
            <p className={`text-sm ${
              mode === 'strict' ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {mode === 'strict' 
                ? 'Any violation will immediately terminate your exam. No warnings given.'
                : 'First violation: Warning. Second violation: Exam terminated.'}
            </p>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            {rules.map((rule, index) => {
              const Icon = rule.icon;
              const enforcement = mode === 'strict' ? rule.strict : rule.lenient;
              
              return (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{rule.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      enforcement.includes('ban') || enforcement.includes('Immediate')
                        ? 'bg-red-100 text-red-800'
                        : enforcement.includes('Blocked')
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {enforcement}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Important Notes */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📌 Important Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All activities are monitored and logged</li>
              <li>• Violations are reported to administrators</li>
              <li>• Exam will auto-submit when time expires</li>
              <li>• Ensure stable internet connection</li>
              <li>• Close all other applications before starting</li>
              <li>• Do not refresh the page during exam</li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onAccept}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 transition-colors font-medium"
          >
            I Understand and Accept the Rules
          </button>
        </div>
      </div>
    </div>
  );
}
