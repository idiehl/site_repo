import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { previewComponent } from '../../lib/canvas-store';

// React component imports
import * as HeroiconsReact from '@heroicons/react/24/outline';

// Custom React component wrappers
function CustomCard({ className, hover, children }: { className?: string; hover?: boolean; children?: React.ReactNode }) {
  return (
    <div 
      className={`bg-night-900 border border-night-800 rounded-xl p-6 transition-all duration-300 ${
        hover ? 'hover:bg-night-800 hover:border-night-700 hover:-translate-y-1 cursor-pointer' : ''
      } ${className || ''}`}
    >
      {children || <div className="text-night-300 text-sm">Card Content</div>}
    </div>
  );
}

function CustomBadge({ variant = 'default', text = 'Badge' }: { variant?: string; text?: string }) {
  const variantClasses: Record<string, string> = {
    default: 'bg-[#5e6bf1]/20 text-[#7e91f8] border-[#5e6bf1]/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant] || variantClasses.default}`}>
      {text}
    </span>
  );
}

function CustomAlert({ type = 'info', title = 'Alert', message = 'This is an alert message.' }: { type?: string; title?: string; message?: string }) {
  const typeConfig: Record<string, { className: string; Icon: any }> = {
    info: { className: 'bg-[#5e6bf1]/10 border-[#5e6bf1]/30 text-[#7e91f8]', Icon: HeroiconsReact.InformationCircleIcon },
    success: { className: 'bg-green-500/10 border-green-500/30 text-green-400', Icon: HeroiconsReact.CheckCircleIcon },
    warning: { className: 'bg-amber-500/10 border-amber-500/30 text-amber-400', Icon: HeroiconsReact.ExclamationTriangleIcon },
    error: { className: 'bg-red-500/10 border-red-500/30 text-red-400', Icon: HeroiconsReact.XCircleIcon },
  };
  
  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.Icon;
  
  return (
    <div className={`rounded-lg border p-4 flex gap-3 ${config.className}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm mt-1 opacity-80">{message}</p>
      </div>
    </div>
  );
}

function CustomButton({ variant = 'primary', size = 'md', text = 'Button', disabled = false }: { variant?: string; size?: string; text?: string; disabled?: boolean }) {
  const variantClasses: Record<string, string> = {
    primary: 'bg-[#4a4de5] hover:bg-[#5e6bf1] text-white',
    secondary: 'bg-[#3b3c51] hover:bg-[#444560] text-[#ececf2] border border-[#444560]',
    ghost: 'bg-transparent hover:bg-[#3b3c51] text-[#b1b3c8] hover:text-[#ececf2]',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  };
  
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      disabled={disabled}
      className={`rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5e6bf1] focus:ring-offset-2 focus:ring-offset-[#0d0d12] ${
        variantClasses[variant] || variantClasses.primary
      } ${sizeClasses[size] || sizeClasses.md} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {text}
    </button>
  );
}

function CustomInput({ placeholder = 'Enter text...', label = 'Label', disabled = false }: { placeholder?: string; label?: string; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-[#b1b3c8]">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-[#3b3c51] border border-[#444560] rounded-lg text-white placeholder-[#686b8e] focus:outline-none focus:ring-2 focus:ring-[#5e6bf1] focus:border-transparent transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      />
    </div>
  );
}

function CustomAvatar({ size = 'md', initials = 'AU', status = 'none' }: { size?: string; initials?: string; status?: string }) {
  const sizeClasses: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };
  
  const statusClasses: Record<string, string> = {
    online: 'bg-green-500',
    offline: 'bg-[#686b8e]',
    busy: 'bg-red-500',
  };
  
  const statusSizes: Record<string, string> = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };
  
  return (
    <div className="relative inline-block">
      <div className={`flex items-center justify-center rounded-full bg-[#4a4de5] text-white font-medium ${sizeClasses[size] || sizeClasses.md}`}>
        {initials}
      </div>
      {status && status !== 'none' && (
        <span className={`absolute bottom-0 right-0 rounded-full border-2 border-[#0d0d12] ${statusClasses[status] || ''} ${statusSizes[size] || statusSizes.md}`} />
      )}
    </div>
  );
}

function CustomProgress({ value = 60, color = 'atlas', showLabel = true }: { value?: number; color?: string; showLabel?: boolean }) {
  const colorClasses: Record<string, string> = {
    atlas: 'bg-[#5e6bf1]',
    gold: 'bg-amber-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };
  
  const percentage = Math.min(100, Math.max(0, value));
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-[#878aa9]">Progress</span>
        {showLabel && <span className="text-white font-medium">{percentage}%</span>}
      </div>
      <div className="h-2 bg-[#3b3c51] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color] || colorClasses.atlas}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Component registry for React
const reactComponents: Record<string, any> = {
  // Heroicons
  ArrowRightIcon: HeroiconsReact.ArrowRightIcon,
  CheckCircleIcon: HeroiconsReact.CheckCircleIcon,
  XMarkIcon: HeroiconsReact.XMarkIcon,
  BellIcon: HeroiconsReact.BellIcon,
  UserIcon: HeroiconsReact.UserIcon,
  Cog6ToothIcon: HeroiconsReact.Cog6ToothIcon,
  // Custom components
  Card: CustomCard,
  Badge: CustomBadge,
  Alert: CustomAlert,
  Button: CustomButton,
  Input: CustomInput,
  Avatar: CustomAvatar,
  Progress: CustomProgress,
};

export default function ReactPreview() {
  const preview = useStore(previewComponent);
  const [component, setComponent] = useState<React.ReactNode>(null);
  
  useEffect(() => {
    if (!preview.libraryId || !preview.componentId) {
      setComponent(null);
      return;
    }
    
    // Only handle React libraries
    if (!preview.libraryId.includes('react')) {
      setComponent(null);
      return;
    }
    
    const Component = reactComponents[preview.componentId];
    if (Component) {
      setComponent(<Component {...preview.props} />);
    } else {
      setComponent(
        <div className="text-[#686b8e] text-sm">
          Component "{preview.componentId}" not found
        </div>
      );
    }
  }, [preview.libraryId, preview.componentId, preview.props]);
  
  // Don't render anything if not a React component
  if (!preview.libraryId?.includes('react')) {
    return null;
  }
  
  return (
    <div className="p-12 bg-[#343446] rounded-xl border border-[#444560] min-w-[200px] flex items-center justify-center">
      {component}
    </div>
  );
}
