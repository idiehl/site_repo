import { useStore } from '@nanostores/react';
import { previewComponent } from '../../lib/canvas-store';
import * as HeroiconsReact from '@heroicons/react/24/outline';

// Custom React components
function CustomCard({ className = '', hover = false }: { className?: string; hover?: boolean }) {
  return (
    <div 
      className={`bg-[#343446] border border-[#444560] rounded-xl p-6 transition-all duration-300 ${
        hover ? 'hover:bg-[#3b3c51] hover:border-[#535576] hover:-translate-y-1 cursor-pointer' : ''
      } ${className}`}
    >
      <div className="text-[#b1b3c8] text-sm">Card Content</div>
    </div>
  );
}

function CustomBadge({ variant = 'default', text = 'Badge' }: { variant?: string; text?: string }) {
  const variants: Record<string, string> = {
    default: 'bg-[#5e6bf1]/20 text-[#7e91f8] border-[#5e6bf1]/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.default}`}>
      {text}
    </span>
  );
}

function CustomAlert({ type = 'info', title = 'Alert', message = 'This is an alert.' }: { type?: string; title?: string; message?: string }) {
  const configs: Record<string, { bg: string; Icon: any }> = {
    info: { bg: 'bg-[#5e6bf1]/10 border-[#5e6bf1]/30', Icon: HeroiconsReact.InformationCircleIcon },
    success: { bg: 'bg-green-500/10 border-green-500/30', Icon: HeroiconsReact.CheckCircleIcon },
    warning: { bg: 'bg-amber-500/10 border-amber-500/30', Icon: HeroiconsReact.ExclamationTriangleIcon },
    error: { bg: 'bg-red-500/10 border-red-500/30', Icon: HeroiconsReact.XCircleIcon },
  };
  const cfg = configs[type] || configs.info;
  return (
    <div className={`rounded-lg border p-4 flex gap-3 ${cfg.bg}`}>
      <cfg.Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-current" />
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm mt-1 opacity-80">{message}</p>
      </div>
    </div>
  );
}

function CustomButton({ variant = 'primary', size = 'md', text = 'Button', disabled = false }: any) {
  const variants: Record<string, string> = {
    primary: 'bg-[#4a4de5] hover:bg-[#5e6bf1] text-white',
    secondary: 'bg-[#3b3c51] hover:bg-[#444560] text-[#ececf2] border border-[#444560]',
    ghost: 'bg-transparent hover:bg-[#3b3c51] text-[#b1b3c8]',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  };
  const sizes: Record<string, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button disabled={disabled} className={`rounded-lg font-medium transition-all ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50' : ''}`}>
      {text}
    </button>
  );
}

function CustomInput({ placeholder = 'Enter text...', label = 'Label', disabled = false }: any) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-[#b1b3c8]">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 bg-[#3b3c51] border border-[#444560] rounded-lg text-white placeholder-[#686b8e] focus:outline-none focus:ring-2 focus:ring-[#5e6bf1]"
      />
    </div>
  );
}

function CustomAvatar({ size = 'md', initials = 'AU', status = 'none' }: any) {
  const sizes: Record<string, string> = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  const statusColors: Record<string, string> = { online: 'bg-green-500', offline: 'bg-[#686b8e]', busy: 'bg-red-500' };
  return (
    <div className="relative inline-block">
      <div className={`flex items-center justify-center rounded-full bg-[#4a4de5] text-white font-medium ${sizes[size]}`}>{initials}</div>
      {status !== 'none' && <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0d0d12] ${statusColors[status]}`} />}
    </div>
  );
}

function CustomProgress({ value = 60, color = 'atlas', showLabel = true }: any) {
  const colors: Record<string, string> = { atlas: 'bg-[#5e6bf1]', gold: 'bg-amber-500', green: 'bg-green-500', red: 'bg-red-500' };
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1 w-48">
      <div className="flex justify-between text-sm">
        <span className="text-[#878aa9]">Progress</span>
        {showLabel && <span className="text-white font-medium">{pct}%</span>}
      </div>
      <div className="h-2 bg-[#3b3c51] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colors[color]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Registry mapping
const registry: Record<string, Record<string, any>> = {
  'heroicons-react': {
    ArrowRightIcon: HeroiconsReact.ArrowRightIcon,
    CheckCircleIcon: HeroiconsReact.CheckCircleIcon,
    XMarkIcon: HeroiconsReact.XMarkIcon,
    BellIcon: HeroiconsReact.BellIcon,
    UserIcon: HeroiconsReact.UserIcon,
    Cog6ToothIcon: HeroiconsReact.Cog6ToothIcon,
  },
  'headless-react': {
    Button: CustomButton,
    Switch: () => <div className="text-[#686b8e]">Switch component</div>,
  },
  'custom-react': {
    Card: CustomCard,
    Badge: CustomBadge,
    Alert: CustomAlert,
    Button: CustomButton,
    Input: CustomInput,
    Avatar: CustomAvatar,
    Progress: CustomProgress,
  },
};

export default function ReactPreviewWrapper() {
  const preview = useStore(previewComponent);
  
  // Only render for React frameworks
  const isReact = preview.libraryId?.includes('react');
  
  if (!isReact) {
    return null;
  }
  
  const libraryComponents = registry[preview.libraryId!];
  if (!libraryComponents) {
    return (
      <div className="p-12 bg-[#343446] rounded-xl border border-[#444560]">
        <div className="text-[#686b8e]">Library not found: {preview.libraryId}</div>
      </div>
    );
  }
  
  const Component = libraryComponents[preview.componentId!];
  if (!Component) {
    return (
      <div className="p-12 bg-[#343446] rounded-xl border border-[#444560]">
        <div className="text-[#686b8e]">Component not found: {preview.componentId}</div>
      </div>
    );
  }
  
  return (
    <div className="p-12 bg-[#343446] rounded-xl border border-[#444560] min-w-[200px] flex items-center justify-center shadow-2xl">
      <Component {...preview.props} />
    </div>
  );
}
