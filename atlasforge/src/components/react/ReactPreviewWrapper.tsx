import { useState, useEffect } from 'react';
import * as HeroiconsReact from '@heroicons/react/24/outline';

// Preview state type
interface PreviewState {
  libraryId: string | null;
  componentId: string | null;
  props: Record<string, any>;
}

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

// Registry mapping - libraries with actual implementations
const registry: Record<string, Record<string, any>> = {
  'heroicons-react': HeroiconsReact as any,
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

// Libraries with full implementations
const implementedLibraries = ['heroicons-react', 'custom-react'];

// Mock preview component for libraries without implementations
function MockReactPreview({ componentId, props, libraryName, category }: { 
  componentId: string; 
  props: Record<string, any>;
  libraryName: string;
  category?: string;
}) {
  const id = componentId.toLowerCase();
  const p = props;
  
  // Color utilities
  const getColorClass = () => {
    const color = p.color || p.colorScheme || p.severity || p.variant || 'primary';
    const colors: Record<string, string> = {
      primary: 'bg-blue-600 text-white',
      blue: 'bg-blue-600 text-white',
      default: 'bg-gray-600 text-white',
      secondary: 'bg-gray-600 text-white',
      success: 'bg-green-600 text-white',
      green: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      danger: 'bg-red-600 text-white',
      destructive: 'bg-red-600 text-white',
      red: 'bg-red-600 text-white',
      warning: 'bg-amber-500 text-black',
      yellow: 'bg-amber-500 text-black',
      orange: 'bg-orange-500 text-white',
      info: 'bg-cyan-600 text-white',
      cyan: 'bg-cyan-600 text-white',
      purple: 'bg-purple-600 text-white',
      violet: 'bg-violet-600 text-white',
      pink: 'bg-pink-600 text-white',
      gray: 'bg-gray-600 text-white',
      outline: 'bg-transparent text-blue-400 border-2 border-blue-400',
      ghost: 'bg-transparent text-blue-400',
      subtle: 'bg-blue-600/20 text-blue-400',
      light: 'bg-blue-600/20 text-blue-400',
      filled: 'bg-blue-600 text-white',
    };
    return colors[color] || colors.primary;
  };
  
  const getSizeClass = () => {
    const size = p.size || 'md';
    const sizes: Record<string, string> = {
      xs: 'text-xs px-2 py-1',
      sm: 'text-sm px-3 py-1.5',
      small: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      medium: 'text-sm px-4 py-2',
      default: 'text-sm px-4 py-2',
      lg: 'text-base px-5 py-2.5',
      large: 'text-base px-5 py-2.5',
      xl: 'text-lg px-6 py-3',
    };
    return sizes[size] || sizes.md;
  };

  const isDisabled = p.disabled || p.isDisabled;
  const label = p.label || p.text || p.title || p.value || componentId;
  const progressValue = p.value || p.modelValue || p.percentage || 50;

  // BUTTONS
  if (id.includes('button') || id.includes('btn') || category === 'buttons') {
    return (
      <button
        className={`rounded-lg font-medium transition-all border ${getColorClass()} ${getSizeClass()} ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
        } ${p.rounded || p.isRound ? 'rounded-full' : ''} ${
          p.loading || p.isLoading ? 'animate-pulse' : ''
        }`}
        disabled={isDisabled}
      >
        {p.loading || p.isLoading ? (
          <svg className="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {label}
      </button>
    );
  }

  // INPUTS
  if (category === 'inputs') {
    if (id.includes('switch') || id.includes('toggle')) {
      const checked = p.modelValue || p.checked || p.defaultChecked;
      return (
        <div className="flex items-center gap-3">
          <button className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-600'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'left-5' : 'left-0.5'}`} />
          </button>
          {p.label && <span className="text-white text-sm">{p.label}</span>}
        </div>
      );
    }
    if (id.includes('checkbox')) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {p.label && <span className="text-white text-sm">{p.label}</span>}
        </div>
      );
    }
    if (id.includes('radio')) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          </div>
          {p.label && <span className="text-white text-sm">{p.label}</span>}
        </div>
      );
    }
    if (id.includes('slider')) {
      return (
        <div className="w-48">
          <div className="relative h-2 bg-gray-700 rounded-full">
            <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: `${progressValue}%` }} />
            <div className="absolute w-4 h-4 bg-white rounded-full shadow -top-1 transform -translate-x-1/2" style={{ left: `${progressValue}%` }} />
          </div>
        </div>
      );
    }
    if (id.includes('select') || id.includes('dropdown') || id.includes('listbox') || id.includes('combobox')) {
      return (
        <div className="w-64">
          {p.label && <label className="block text-sm text-gray-400 mb-1">{p.label}</label>}
          <div className="relative">
            <select className="w-full px-3 py-2 bg-[#343446] border border-[#444560] rounded-lg text-white appearance-none">
              <option>{p.placeholder || 'Select...'}</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      );
    }
    if (id.includes('textarea')) {
      return (
        <div className="w-64">
          {p.label && <label className="block text-sm text-gray-400 mb-1">{p.label}</label>}
          <textarea
            placeholder={p.placeholder || 'Enter text...'}
            className="w-full px-3 py-2 bg-[#343446] border border-[#444560] rounded-lg text-white resize-none"
            rows={3}
          />
        </div>
      );
    }
    // Default input
    return (
      <div className="w-64">
        {p.label && <label className="block text-sm text-gray-400 mb-1">{p.label}</label>}
        <input
          type="text"
          placeholder={p.placeholder || 'Enter text...'}
          className={`w-full px-3 py-2 bg-[#343446] border rounded-lg text-white ${
            p.error || p.invalid || p.isInvalid ? 'border-red-500' : 'border-[#444560]'
          }`}
        />
        {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
        {p.error && <p className="text-xs text-red-400 mt-1">{p.error}</p>}
      </div>
    );
  }

  // LAYOUT
  if (category === 'layout') {
    if (id.includes('card') || id.includes('paper')) {
      return (
        <div className={`w-64 p-4 rounded-xl bg-[#343446] border border-[#444560] ${p.hover || p.hoverable ? 'hover:border-gray-500' : ''}`}>
          {(p.title || p.header) && <h3 className="font-semibold text-white mb-2">{p.title || p.header}</h3>}
          <p className="text-gray-400 text-sm">Card content preview</p>
        </div>
      );
    }
    if (id.includes('accordion') || id.includes('collapse') || id.includes('disclosure')) {
      return (
        <div className="w-64 border border-[#444560] rounded-lg overflow-hidden">
          <button className="w-full px-4 py-3 bg-[#343446] text-white text-left flex justify-between items-center">
            <span>{p.header || 'Accordion'}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="px-4 py-3 bg-[#2a2a3d] text-gray-400 text-sm">Content</div>
        </div>
      );
    }
    if (id.includes('divider') || id.includes('separator')) {
      return <div className={p.orientation === 'vertical' ? 'w-px h-16 bg-[#444560]' : 'w-48 h-px bg-[#444560]'} />;
    }
    return <div className="w-64 p-4 rounded-xl bg-[#343446] border border-[#444560] text-gray-400 text-sm">{componentId}</div>;
  }

  // FEEDBACK
  if (category === 'feedback') {
    if (id.includes('progress') && !id.includes('circular') && !id.includes('ring')) {
      return (
        <div className="w-48">
          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full bg-blue-600 rounded-full ${p.striped || p.hasStripe ? 'animate-pulse' : ''}`} style={{ width: `${progressValue}%` }} />
          </div>
          {(p.showValue || p.showLabel) && <p className="text-xs text-gray-400 mt-1 text-center">{progressValue}%</p>}
        </div>
      );
    }
    if (id.includes('circular') || id.includes('ring') || id.includes('spinner') || id.includes('loader')) {
      return (
        <svg className={`transform -rotate-90 ${p.indeterminate ? 'animate-spin' : ''}`} width={p.size || 64} height={p.size || 64}>
          <circle className="text-gray-700" stroke="currentColor" strokeWidth="8" fill="transparent" r={((p.size || 64) / 2) - 8} cx={(p.size || 64) / 2} cy={(p.size || 64) / 2} />
          <circle className="text-blue-600" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round" r={((p.size || 64) / 2) - 8} cx={(p.size || 64) / 2} cy={(p.size || 64) / 2} strokeDasharray={`${progressValue * 1.5} 150`} />
        </svg>
      );
    }
    if (id.includes('alert') || id.includes('message') || id.includes('notification')) {
      const type = p.type || p.status || p.severity || 'info';
      const bgColors: Record<string, string> = {
        success: 'bg-green-600/20 border-green-600/50 text-green-400',
        error: 'bg-red-600/20 border-red-600/50 text-red-400',
        danger: 'bg-red-600/20 border-red-600/50 text-red-400',
        warning: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
        warn: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
        info: 'bg-blue-600/20 border-blue-600/50 text-blue-400',
      };
      return (
        <div className={`w-72 p-4 rounded-lg border flex gap-3 ${bgColors[type] || bgColors.info}`}>
          <div className="flex-1">
            {p.title && <p className="font-medium">{p.title}</p>}
            <p className="text-sm opacity-80">{p.message || p.text || 'Alert message'}</p>
          </div>
        </div>
      );
    }
    if (id.includes('skeleton')) {
      return (
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-48" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-36" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-40" />
        </div>
      );
    }
    if (id.includes('badge')) {
      return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClass()}`}>{p.content || p.value || 'Badge'}</span>;
    }
  }

  // NAVIGATION
  if (category === 'navigation') {
    if (id.includes('tab')) {
      return (
        <div className="w-72 flex border-b border-[#444560]">
          <button className="px-4 py-2 text-blue-400 border-b-2 border-blue-400 font-medium text-sm">Tab 1</button>
          <button className="px-4 py-2 text-gray-400 text-sm">Tab 2</button>
          <button className="px-4 py-2 text-gray-400 text-sm">Tab 3</button>
        </div>
      );
    }
    if (id.includes('breadcrumb')) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <a className="text-gray-400 hover:text-white">Home</a>
          <span className="text-gray-600">{p.separator || '/'}</span>
          <a className="text-gray-400 hover:text-white">Category</a>
          <span className="text-gray-600">{p.separator || '/'}</span>
          <span className="text-white">Current</span>
        </div>
      );
    }
    if (id.includes('pagination')) {
      return (
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded bg-[#343446] text-gray-400">&lt;</button>
          <button className="w-8 h-8 rounded bg-blue-600 text-white">1</button>
          <button className="w-8 h-8 rounded bg-[#343446] text-gray-400">2</button>
          <button className="w-8 h-8 rounded bg-[#343446] text-gray-400">3</button>
          <button className="w-8 h-8 rounded bg-[#343446] text-gray-400">&gt;</button>
        </div>
      );
    }
    if (id.includes('step')) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</div>
            <div className="w-12 h-0.5 bg-blue-600" />
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</div>
            <div className="w-12 h-0.5 bg-gray-600" />
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center text-sm">3</div>
        </div>
      );
    }
    if (id.includes('menu') || id.includes('nav')) {
      return (
        <div className="w-48 bg-[#343446] rounded-lg border border-[#444560] py-1">
          <a className="block px-4 py-2 text-white hover:bg-[#3b3c51] text-sm">Menu Item 1</a>
          <a className="block px-4 py-2 text-gray-400 hover:bg-[#3b3c51] text-sm">Menu Item 2</a>
        </div>
      );
    }
  }

  // DATA
  if (category === 'data') {
    if (id.includes('avatar')) {
      const sizes: Record<string, string> = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl', xl: 'w-20 h-20 text-2xl' };
      return (
        <div className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium ${sizes[p.size] || sizes.md}`}>
          {p.initials || p.name?.charAt(0) || 'A'}
        </div>
      );
    }
    if (id.includes('badge') || id.includes('tag') || id.includes('chip')) {
      return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClass()}`}>{p.content || p.value || p.text || 'Tag'}</span>;
    }
    if (id.includes('table')) {
      return (
        <div className="w-72 border border-[#444560] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#343446]">
              <tr>
                <th className="px-3 py-2 text-left text-gray-300">Name</th>
                <th className="px-3 py-2 text-left text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#444560]">
              <tr><td className="px-3 py-2 text-white">Item 1</td><td className="px-3 py-2 text-green-400">Active</td></tr>
              <tr><td className="px-3 py-2 text-white">Item 2</td><td className="px-3 py-2 text-gray-400">Inactive</td></tr>
            </tbody>
          </table>
        </div>
      );
    }
  }

  // OVERLAYS
  if (category === 'overlays') {
    if (id.includes('dialog') || id.includes('modal')) {
      return (
        <div className="w-72 bg-[#343446] rounded-xl border border-[#444560] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#444560]">
            <h3 className="font-medium text-white">{p.title || 'Modal'}</h3>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-4 text-gray-300 text-sm">Modal content...</div>
          <div className="px-4 py-3 bg-[#2a2a3d] flex justify-end gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-400">Cancel</button>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">Confirm</button>
          </div>
        </div>
      );
    }
    if (id.includes('drawer') || id.includes('sheet')) {
      return (
        <div className="w-48 h-48 bg-[#343446] rounded-lg border border-[#444560] flex flex-col">
          <div className="px-4 py-3 border-b border-[#444560]"><h3 className="font-medium text-white text-sm">{p.title || 'Drawer'}</h3></div>
          <div className="flex-1 p-4 text-gray-400 text-xs">Content...</div>
        </div>
      );
    }
    if (id.includes('tooltip')) {
      return (
        <div className="relative">
          <div className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg shadow-lg">{p.label || p.text || 'Tooltip'}</div>
          {(p.hasArrow !== false && p.withArrow !== false) && <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-700 rotate-45" />}
        </div>
      );
    }
    if (id.includes('popover') || id.includes('hover')) {
      return (
        <div className="w-48 bg-[#343446] rounded-lg border border-[#444560] shadow-xl p-3">
          <p className="text-white text-sm font-medium mb-1">Popover</p>
          <p className="text-gray-400 text-xs">Content here.</p>
        </div>
      );
    }
    if (id.includes('menu') || id.includes('dropdown') || id.includes('context')) {
      return (
        <div className="w-40 bg-[#343446] rounded-lg border border-[#444560] shadow-xl py-1">
          <button className="w-full px-3 py-2 text-left text-sm text-white hover:bg-[#3b3c51]">Action 1</button>
          <button className="w-full px-3 py-2 text-left text-sm text-white hover:bg-[#3b3c51]">Action 2</button>
          <div className="border-t border-[#444560] my-1" />
          <button className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-[#3b3c51]">Delete</button>
        </div>
      );
    }
  }

  // TYPOGRAPHY
  if (category === 'typography') {
    if (id.includes('heading') || id.includes('title')) {
      const sizes: Record<string, string> = { h1: 'text-4xl', h2: 'text-3xl', h3: 'text-2xl', h4: 'text-xl', h5: 'text-lg' };
      return <div className={`font-bold text-white ${sizes[p.size || p.as] || 'text-2xl'}`}>Heading</div>;
    }
    if (id.includes('text')) {
      return <div className="text-gray-300">Sample body text</div>;
    }
    if (id.includes('code') || id.includes('kbd')) {
      return <span className="px-2 py-1 bg-[#343446] text-pink-400 font-mono text-sm rounded">code</span>;
    }
    if (id.includes('highlight')) {
      return <span className="text-white">Some <span className="bg-yellow-500/30 px-1">highlighted</span> text</span>;
    }
  }

  // DEFAULT
  return (
    <div className="text-center">
      <div className="text-gray-500 text-sm italic mb-2">{componentId}</div>
      <div className="text-xs text-gray-600">Mock • {libraryName}</div>
    </div>
  );
}

// Extended preview state with category info
interface ExtendedPreviewState extends PreviewState {
  category?: string;
  libraryName?: string;
}

export default function ReactPreviewWrapper() {
  const [preview, setPreview] = useState<ExtendedPreviewState>({
    libraryId: null,
    componentId: null,
    props: {},
  });
  
  // Listen for preview changes from Vue via custom events
  useEffect(() => {
    const handlePreviewChange = (event: CustomEvent<ExtendedPreviewState>) => {
      console.log('React received preview event:', event.detail);
      setPreview(event.detail);
    };
    
    window.addEventListener('forge:preview-change', handlePreviewChange as EventListener);
    
    // Also check for initial state from window
    if ((window as any).__forgePreview) {
      setPreview((window as any).__forgePreview);
    }
    
    return () => {
      window.removeEventListener('forge:preview-change', handlePreviewChange as EventListener);
    };
  }, []);
  
  // Only render for React frameworks
  const isReact = preview.libraryId?.includes('react') || 
                  ['chakraui', 'mantine', 'shadcnui', 'radixui'].includes(preview.libraryId || '');
  
  if (!isReact || !preview.libraryId || !preview.componentId) {
    return null;
  }
  
  // Check if we have an actual implementation
  const hasImplementation = implementedLibraries.includes(preview.libraryId);
  
  if (hasImplementation) {
    const libraryComponents = registry[preview.libraryId];
    if (libraryComponents) {
      const Component = libraryComponents[preview.componentId];
      if (Component) {
        return (
          <div className="p-12 bg-[#343446] rounded-xl border border-[#444560] min-w-[200px] flex items-center justify-center shadow-2xl">
            <Component {...preview.props} />
          </div>
        );
      }
    }
  }
  
  // Use mock preview for libraries without implementations
  const libraryNames: Record<string, string> = {
    'heroicons-react': 'Heroicons',
    'custom-react': 'Atlas Components',
    'chakraui': 'Chakra UI',
    'mantine': 'Mantine',
    'shadcnui': 'shadcn/ui',
    'radixui': 'Radix UI',
    'headless-react': 'Headless UI',
  };
  
  return (
    <div className="p-8 bg-[#343446] rounded-xl border border-[#444560] min-w-[200px] flex flex-col items-center justify-center shadow-2xl">
      <MockReactPreview 
        componentId={preview.componentId}
        props={preview.props}
        libraryName={libraryNames[preview.libraryId] || preview.libraryId}
        category={preview.category}
      />
    </div>
  );
}
