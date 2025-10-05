import { Star, Lock } from 'lucide-react';

// Core Badge Component (with stars)
export function CoreBadge({ subject, level, stars, maxStars = 10 }) {
  const isLocked = stars === 0;
  
  // Determine tint based on stars
  const getTint = () => {
    if (stars === 0) return 'grayscale opacity-50';
    if (stars <= 3) return 'sepia-[.3] hue-rotate-[15deg]'; // Bronze tint
    if (stars <= 6) return 'brightness-110 contrast-90'; // Silver tint
    if (stars <= 9) return 'hue-rotate-[30deg] saturate-150'; // Gold tint
    return 'hue-rotate-[270deg] saturate-200 brightness-110'; // Platinum tint
  };

  const getBorderColor = () => {
    if (stars === 0) return 'border-gray-300';
    if (stars <= 3) return 'border-orange-400';
    if (stars <= 6) return 'border-gray-400';
    if (stars <= 9) return 'border-yellow-400';
    return 'border-purple-400';
  };

  const getStarColor = () => {
    if (stars === 0) return 'text-gray-300';
    if (stars <= 3) return 'text-orange-500';
    if (stars <= 6) return 'text-gray-500';
    if (stars <= 9) return 'text-yellow-500';
    return 'text-purple-500';
  };

  return (
    <div className="relative group">
      <div className={`relative w-32 h-32 rounded-lg border-4 ${getBorderColor()} bg-gradient-to-br from-white to-gray-50 flex flex-col items-center justify-center p-4 transition-all hover:scale-105 ${getTint()}`}>
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-20 rounded-lg">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <div className="text-center">
          <p className="text-xs font-medium text-gray-600 mb-1">{subject}</p>
          <p className="text-sm font-bold text-gray-900">{level}</p>
          
          {!isLocked && (
            <div className="mt-2">
              <div className={`text-2xl font-bold ${getStarColor()}`}>
                {stars}★
              </div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[...Array(maxStars)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2 h-2 ${i < stars ? getStarColor() : 'text-gray-300'}`}
                    fill={i < stars ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {isLocked ? 'Not yet earned' : `${stars}/${maxStars} stars`}
      </div>
    </div>
  );
}

// Soft Badge Component (achievement)
export function SoftBadge({ name, tier, icon, earned = false }) {
  const getTierColor = () => {
    switch (tier) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-300 to-purple-500';
      default: return 'from-gray-300 to-gray-500';
    }
  };

  const getTierBorder = () => {
    switch (tier) {
      case 'bronze': return 'border-orange-500';
      case 'silver': return 'border-gray-400';
      case 'gold': return 'border-yellow-500';
      case 'platinum': return 'border-purple-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className="relative group">
      <div className={`relative w-24 h-24 rounded-full border-4 ${getTierBorder()} bg-gradient-to-br ${getTierColor()} flex items-center justify-center transition-all hover:scale-105 ${!earned && 'grayscale opacity-40'}`}>
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-30 rounded-full">
            <Lock className="w-6 h-6 text-white" />
          </div>
        )}
        
        <span className="text-3xl">{icon}</span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        <p className="font-medium">{name}</p>
        <p className="text-gray-300 capitalize">{tier} tier</p>
      </div>
    </div>
  );
}

// Badge Grid Component
export function BadgeGrid({ children, title }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {title && <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>}
      <div className="flex flex-wrap gap-4">
        {children}
      </div>
    </div>
  );
}
