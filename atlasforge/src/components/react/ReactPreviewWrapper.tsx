/**
 * ReactPreviewWrapper - Renders React component previews using dynamic library loading
 * Supports all React libraries with provider injection
 */
import React, { useState, useEffect, useCallback } from 'react';
import * as HeroiconsReact from '@heroicons/react/24/outline';
import { loadLibrary, isLibraryLoaded, getLoadedLibrary, type LibraryId } from '../../lib/library-loader';

// Custom React components (always available)
function CustomCard({ className = '', hover = false, children }: any) {
  return (
    <div className={`bg-[#343446] border border-[#444560] rounded-xl p-6 transition-all duration-300 ${hover ? 'hover:bg-[#3b3c51] hover:border-[#535576] hover:-translate-y-1 cursor-pointer' : ''} ${className}`}>
      {children || <div className="text-[#b1b3c8] text-sm">Card Content</div>}
    </div>
  );
}

function CustomBadge({ variant = 'default', text = 'Badge' }: any) {
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

function CustomAlert({ type = 'info', title = 'Alert', message = 'This is an alert.' }: any) {
  const configs: Record<string, string> = {
    info: 'bg-[#5e6bf1]/10 border-[#5e6bf1]/30 text-[#7e91f8]',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
  };
  return (
    <div className={`rounded-lg border p-4 ${configs[type] || configs.info}`}>
      <h4 className="font-medium text-white">{title}</h4>
      <p className="text-sm mt-1 opacity-80">{message}</p>
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
      <input type="text" placeholder={placeholder} disabled={disabled} className="w-full px-3 py-2 bg-[#3b3c51] border border-[#444560] rounded-lg text-white placeholder-[#686b8e] focus:outline-none focus:ring-2 focus:ring-[#5e6bf1]" />
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

function CustomTabs({ tabs = 'Tab 1,Tab 2,Tab 3', activeIndex = 0 }: any) {
  const tabList = tabs.split(',');
  return (
    <div className="border-b border-[#444560]">
      <div className="flex gap-1">
        {tabList.map((tab: string, i: number) => (
          <button key={i} className={`px-4 py-2 text-sm font-medium transition-colors ${i === activeIndex ? 'text-[#7e91f8] border-b-2 border-[#5e6bf1]' : 'text-[#878aa9] hover:text-white'}`}>
            {tab.trim()}
          </button>
        ))}
      </div>
    </div>
  );
}

// Custom components registry
const customReactComponents: Record<string, any> = {
  Card: CustomCard,
  Badge: CustomBadge,
  Alert: CustomAlert,
  Button: CustomButton,
  Input: CustomInput,
  Avatar: CustomAvatar,
  Progress: CustomProgress,
  Tabs: CustomTabs,
};

// Mock preview for components that can't be rendered
function MockReactPreview({ componentId, props, category, libraryName }: any) {
  const colorValue = props.color || props.variant || 'default';
  const sizeValue = props.size || 'md';
  const isDisabled = props.disabled || props.isDisabled;
  const labelText = props.text || props.label || props.children || componentId;
  const progressValue = props.value || props.progress || 60;
  
  const colorMap: Record<string, string> = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-amber-500 text-white',
    error: 'bg-red-600 text-white',
    danger: 'bg-red-600 text-white',
    info: 'bg-sky-600 text-white',
    default: 'bg-[#5e6bf1] text-white',
  };
  
  const sizeMap: Record<string, string> = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
    xl: 'text-lg px-6 py-3',
  };
  
  // Render based on category
  if (category === 'buttons') {
    return (
      <button className={`rounded-lg font-medium transition-colors ${colorMap[colorValue] || colorMap.default} ${sizeMap[sizeValue] || sizeMap.md} ${isDisabled ? 'opacity-50' : 'hover:brightness-110'}`} disabled={isDisabled}>
        {labelText}
      </button>
    );
  }
  
  if (category === 'inputs') {
    const lowerName = componentId.toLowerCase();
    if (lowerName.includes('switch') || lowerName.includes('toggle')) {
      return (
        <div className="flex items-center gap-2">
          <div className={`w-11 h-6 rounded-full relative transition-colors ${props.checked ? 'bg-[#5e6bf1]' : 'bg-[#444560]'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${props.checked ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </div>
      );
    }
    if (lowerName.includes('checkbox')) {
      return (
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${props.checked ? 'bg-[#5e6bf1] border-[#5e6bf1]' : 'border-[#444560]'}`}>
            {props.checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-[#b1b3c8]">{labelText}</span>
        </div>
      );
    }
    if (lowerName.includes('slider')) {
      return (
        <div className="w-48">
          <div className="h-2 bg-[#444560] rounded-full">
            <div className="h-full bg-[#5e6bf1] rounded-full" style={{ width: `${progressValue}%` }} />
          </div>
        </div>
      );
    }
    return (
      <input type="text" placeholder={props.placeholder || 'Enter text...'} className="px-3 py-2 bg-[#343446] border border-[#444560] rounded-lg text-white w-48" />
    );
  }
  
  if (category === 'feedback') {
    const lowerName = componentId.toLowerCase();
    if (lowerName.includes('progress')) {
      return (
        <div className="w-48">
          <div className="h-2 bg-[#444560] rounded-full overflow-hidden">
            <div className="h-full bg-[#5e6bf1] rounded-full transition-all" style={{ width: `${progressValue}%` }} />
          </div>
          <div className="text-xs text-[#878aa9] mt-1 text-center">{progressValue}%</div>
        </div>
      );
    }
    if (lowerName.includes('spinner') || lowerName.includes('loader')) {
      return <div className="w-8 h-8 border-2 border-[#5e6bf1] border-t-transparent rounded-full animate-spin" />;
    }
    if (lowerName.includes('skeleton')) {
      return <div className="w-48 h-4 bg-[#444560] rounded animate-pulse" />;
    }
    if (lowerName.includes('alert')) {
      return (
        <div className={`rounded-lg border p-4 ${colorMap[colorValue] ? colorMap[colorValue].replace('text-white', '') : 'bg-[#5e6bf1]/10 border-[#5e6bf1]/30'}`}>
          <div className="font-medium text-white">{props.title || 'Alert'}</div>
          <div className="text-sm text-[#b1b3c8] mt-1">{props.message || props.description || 'Alert message'}</div>
        </div>
      );
    }
    return <div className="text-[#b1b3c8] text-sm">{componentId}</div>;
  }
  
  if (category === 'layout') {
    const lowerName = componentId.toLowerCase();
    if (lowerName.includes('card')) {
      return (
        <div className="bg-[#343446] border border-[#444560] rounded-xl p-6 w-64">
          <div className="font-medium text-white">{props.title || 'Card Title'}</div>
          <div className="text-sm text-[#b1b3c8] mt-2">{props.description || 'Card content preview'}</div>
        </div>
      );
    }
    if (lowerName.includes('divider') || lowerName.includes('separator')) {
      return <div className="w-48 h-px bg-[#444560]" />;
    }
    return <div className="border border-dashed border-[#444560] rounded-lg p-4 text-[#878aa9] text-sm">{componentId}</div>;
  }
  
  if (category === 'data') {
    const lowerName = componentId.toLowerCase();
    if (lowerName.includes('avatar')) {
      return (
        <div className="w-12 h-12 rounded-full bg-[#5e6bf1] flex items-center justify-center text-white font-medium">
          {props.initials || 'AU'}
        </div>
      );
    }
    if (lowerName.includes('badge') || lowerName.includes('tag') || lowerName.includes('chip')) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[colorValue] || 'bg-[#5e6bf1]/20 text-[#7e91f8]'}`}>
          {labelText}
        </span>
      );
    }
    return <div className="text-[#b1b3c8] text-sm">{componentId}</div>;
  }
  
  if (category === 'navigation') {
    const lowerName = componentId.toLowerCase();
    if (lowerName.includes('tab')) {
      return (
        <div className="flex gap-4 border-b border-[#444560]">
          <span className="text-[#7e91f8] border-b-2 border-[#5e6bf1] pb-2 px-1">Tab 1</span>
          <span className="text-[#878aa9] pb-2 px-1">Tab 2</span>
          <span className="text-[#878aa9] pb-2 px-1">Tab 3</span>
        </div>
      );
    }
    if (lowerName.includes('breadcrumb')) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#7e91f8]">Home</span>
          <span className="text-[#686b8e]">/</span>
          <span className="text-[#7e91f8]">Products</span>
          <span className="text-[#686b8e]">/</span>
          <span className="text-[#b1b3c8]">Current</span>
        </div>
      );
    }
    return <div className="text-[#b1b3c8] text-sm">{componentId}</div>;
  }
  
  if (category === 'icons') {
    return (
      <svg className="w-8 h-8 text-[#7e91f8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  
  // Default fallback
  return (
    <div className="text-center">
      <div className="text-[#b1b3c8] text-sm">{componentId}</div>
      <div className="text-xs text-[#686b8e] mt-1">Mock preview • {libraryName}</div>
    </div>
  );
}

// Preview state interface
interface PreviewState {
  libraryId: string;
  componentId: string;
  props: Record<string, any>;
  category?: string;
  libraryName?: string;
}

export default function ReactPreviewWrapper() {
  const [preview, setPreview] = useState<PreviewState>({
    libraryId: '',
    componentId: '',
    props: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [LoadedComponent, setLoadedComponent] = useState<React.ComponentType<any> | null>(null);
  const [mode, setMode] = useState<'preview' | 'canvas'>('preview');
  
  // Map registry IDs to loader IDs
  const getLoaderLibraryId = (registryId: string): LibraryId | null => {
    const mapping: Record<string, LibraryId> = {
      'heroicons-vue': 'heroicons-vue',
      'heroicons-react': 'heroicons-react',
      'headless-vue': 'headless-vue',
      'headless-react': 'headless-react',
      'custom-vue': 'custom-vue',
      'custom-react': 'custom-react',
      'vuetify': 'vuetify',
      'primevue': 'primevue',
      'naiveui': 'naiveui',
      'chakraui': 'chakraui',
      'mantine': 'mantine',
      'radixui': 'radixui',
      'shadcnui': 'shadcnui',
    };
    return mapping[registryId] || null;
  };
  
  // Load component when preview changes
  const loadComponent = useCallback(async () => {
    if (!preview.libraryId || !preview.componentId) {
      setLoadedComponent(null);
      return;
    }
    
    // Handle always-available libraries
    if (preview.libraryId === 'heroicons-react') {
      const Comp = (HeroiconsReact as any)[preview.componentId];
      setLoadedComponent(() => Comp || null);
      setLoadError(Comp ? null : `Component ${preview.componentId} not found`);
      return;
    }
    
    if (preview.libraryId === 'custom-react') {
      const Comp = customReactComponents[preview.componentId];
      setLoadedComponent(() => Comp || null);
      setLoadError(Comp ? null : `Component ${preview.componentId} not found`);
      return;
    }
    
    // For other libraries, try to load dynamically
    const loaderLibraryId = getLoaderLibraryId(preview.libraryId);
    if (!loaderLibraryId) {
      setLoadError(`Unknown library: ${preview.libraryId}`);
      setLoadedComponent(null);
      return;
    }
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const library = await loadLibrary(loaderLibraryId);
      const Comp = library.components[preview.componentId];
      
      if (Comp) {
        setLoadedComponent(() => Comp);
        setLoadError(null);
      } else {
        setLoadError(`Component ${preview.componentId} not found in ${preview.libraryId}`);
        setLoadedComponent(null);
      }
    } catch (err: any) {
      console.error('Failed to load library:', err);
      setLoadError(err.message || 'Failed to load library');
      setLoadedComponent(null);
    } finally {
      setIsLoading(false);
    }
  }, [preview.libraryId, preview.componentId]);
  
  // Listen for preview changes from Vue
  useEffect(() => {
    const handlePreviewChange = (event: CustomEvent<PreviewState>) => {
      setPreview(event.detail);
    };
    
    const handleModeChange = (event: CustomEvent<{ mode: 'preview' | 'canvas' }>) => {
      setMode(event.detail.mode);
    };
    
    window.addEventListener('forge:preview-change', handlePreviewChange as EventListener);
    window.addEventListener('forge:mode-change', handleModeChange as EventListener);
    
    // Check for initial state
    if ((window as any).__forgePreview) {
      setPreview((window as any).__forgePreview);
    }
    if ((window as any).__forgeMode) {
      setMode((window as any).__forgeMode);
    }
    
    return () => {
      window.removeEventListener('forge:preview-change', handlePreviewChange as EventListener);
      window.removeEventListener('forge:mode-change', handleModeChange as EventListener);
    };
  }, []);
  
  // Load component when preview changes
  useEffect(() => {
    loadComponent();
  }, [loadComponent]);
  
  // Hide when in canvas mode
  if (mode === 'canvas') {
    return null;
  }
  
  // Only render for React libraries
  const isReact = ['heroicons-react', 'headless-react', 'custom-react', 'chakraui', 'mantine', 'radixui', 'shadcnui'].includes(preview.libraryId);
  
  if (!isReact || !preview.libraryId) {
    return null;
  }
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="p-8 bg-[#343446] rounded-xl border border-[#444560] min-w-[200px] flex flex-col items-center justify-center shadow-2xl">
        <div className="w-8 h-8 border-2 border-[#5e6bf1] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-[#878aa9] text-sm">Loading...</span>
      </div>
    );
  }
  
  // Render loaded component
  if (LoadedComponent) {
    // Handle components that need children
    const needsChildren = ['Button', 'Badge', 'Text', 'Heading', 'Link', 'Tab', 'MenuItem'];
    const children = needsChildren.some(name => preview.componentId.includes(name))
      ? (preview.props.children || preview.props.label || preview.props.text || preview.componentId)
      : undefined;
    
    return (
      <div className="p-12 bg-[#343446] rounded-xl border border-[#444560] min-w-[200px] flex items-center justify-center shadow-2xl">
        <LoadedComponent {...preview.props}>
          {children}
        </LoadedComponent>
      </div>
    );
  }
  
  // Render mock preview on error or missing component
  return (
    <div className="p-8 bg-[#343446] rounded-xl border border-[#444560] min-w-[200px] flex flex-col items-center justify-center shadow-2xl">
      <MockReactPreview
        componentId={preview.componentId}
        props={preview.props}
        category={preview.category}
        libraryName={preview.libraryName || preview.libraryId}
      />
    </div>
  );
}
