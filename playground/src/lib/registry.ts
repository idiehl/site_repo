/**
 * Component Registry - Metadata for all available UI components
 * Organized by library and framework
 */

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'class';
  default: any;
  options?: string[]; // For select type
  description?: string;
}

export interface ComponentMeta {
  id: string;
  name: string;
  description: string;
  props: ComponentProp[];
  defaultProps: Record<string, any>;
  category: 'icons' | 'buttons' | 'inputs' | 'layout' | 'feedback' | 'navigation' | 'data';
}

export interface LibraryMeta {
  id: string;
  name: string;
  framework: 'vue' | 'react';
  description: string;
  website: string;
  components: ComponentMeta[];
}

// Heroicons Vue
const heroiconsVue: LibraryMeta = {
  id: 'heroicons-vue',
  name: 'Heroicons (Vue)',
  framework: 'vue',
  description: 'Beautiful hand-crafted SVG icons by the Tailwind CSS team',
  website: 'https://heroicons.com',
  components: [
    {
      id: 'ArrowRightIcon',
      name: 'Arrow Right',
      description: 'Right-pointing arrow icon',
      category: 'icons',
      props: [
        { name: 'class', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { class: 'w-6 h-6 text-atlas-400' },
    },
    {
      id: 'CheckCircleIcon',
      name: 'Check Circle',
      description: 'Checkmark inside a circle',
      category: 'icons',
      props: [
        { name: 'class', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { class: 'w-6 h-6 text-green-500' },
    },
    {
      id: 'XMarkIcon',
      name: 'X Mark',
      description: 'X/close icon',
      category: 'icons',
      props: [
        { name: 'class', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { class: 'w-6 h-6 text-red-500' },
    },
    {
      id: 'BellIcon',
      name: 'Bell',
      description: 'Notification bell icon',
      category: 'icons',
      props: [
        { name: 'class', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { class: 'w-6 h-6 text-gold-500' },
    },
    {
      id: 'UserIcon',
      name: 'User',
      description: 'User profile icon',
      category: 'icons',
      props: [
        { name: 'class', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { class: 'w-6 h-6 text-atlas-400' },
    },
    {
      id: 'CogIcon',
      name: 'Cog / Settings',
      description: 'Settings gear icon',
      category: 'icons',
      props: [
        { name: 'class', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { class: 'w-6 h-6 text-night-400' },
    },
  ],
};

// Heroicons React
const heroiconsReact: LibraryMeta = {
  id: 'heroicons-react',
  name: 'Heroicons (React)',
  framework: 'react',
  description: 'Beautiful hand-crafted SVG icons by the Tailwind CSS team',
  website: 'https://heroicons.com',
  components: [
    {
      id: 'ArrowRightIcon',
      name: 'Arrow Right',
      description: 'Right-pointing arrow icon',
      category: 'icons',
      props: [
        { name: 'className', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { className: 'w-6 h-6 text-atlas-400' },
    },
    {
      id: 'CheckCircleIcon',
      name: 'Check Circle',
      description: 'Checkmark inside a circle',
      category: 'icons',
      props: [
        { name: 'className', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { className: 'w-6 h-6 text-green-500' },
    },
    {
      id: 'XMarkIcon',
      name: 'X Mark',
      description: 'X/close icon',
      category: 'icons',
      props: [
        { name: 'className', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { className: 'w-6 h-6 text-red-500' },
    },
    {
      id: 'BellIcon',
      name: 'Bell',
      description: 'Notification bell icon',
      category: 'icons',
      props: [
        { name: 'className', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { className: 'w-6 h-6 text-gold-500' },
    },
    {
      id: 'UserIcon',
      name: 'User',
      description: 'User profile icon',
      category: 'icons',
      props: [
        { name: 'className', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { className: 'w-6 h-6 text-atlas-400' },
    },
    {
      id: 'Cog6ToothIcon',
      name: 'Cog / Settings',
      description: 'Settings gear icon',
      category: 'icons',
      props: [
        { name: 'className', type: 'class', default: 'w-6 h-6', description: 'Tailwind classes' },
      ],
      defaultProps: { className: 'w-6 h-6 text-night-400' },
    },
  ],
};

// Headless UI Vue
const headlessVue: LibraryMeta = {
  id: 'headless-vue',
  name: 'Headless UI (Vue)',
  framework: 'vue',
  description: 'Completely unstyled, accessible UI components',
  website: 'https://headlessui.com',
  components: [
    {
      id: 'Button',
      name: 'Button',
      description: 'Accessible button component',
      category: 'buttons',
      props: [
        { name: 'class', type: 'class', default: 'px-4 py-2 rounded', description: 'Tailwind classes' },
        { name: 'disabled', type: 'boolean', default: false, description: 'Disable button' },
      ],
      defaultProps: { 
        class: 'px-4 py-2 bg-atlas-600 text-white rounded-lg hover:bg-atlas-500 transition-colors',
        disabled: false,
      },
    },
    {
      id: 'Switch',
      name: 'Toggle Switch',
      description: 'Toggle switch for boolean values',
      category: 'inputs',
      props: [
        { name: 'modelValue', type: 'boolean', default: false, description: 'Switch state' },
      ],
      defaultProps: { modelValue: false },
    },
  ],
};

// Headless UI React
const headlessReact: LibraryMeta = {
  id: 'headless-react',
  name: 'Headless UI (React)',
  framework: 'react',
  description: 'Completely unstyled, accessible UI components',
  website: 'https://headlessui.com',
  components: [
    {
      id: 'Button',
      name: 'Button',
      description: 'Accessible button component',
      category: 'buttons',
      props: [
        { name: 'className', type: 'class', default: 'px-4 py-2 rounded', description: 'Tailwind classes' },
        { name: 'disabled', type: 'boolean', default: false, description: 'Disable button' },
      ],
      defaultProps: { 
        className: 'px-4 py-2 bg-atlas-600 text-white rounded-lg hover:bg-atlas-500 transition-colors',
        disabled: false,
      },
    },
    {
      id: 'Switch',
      name: 'Toggle Switch',
      description: 'Toggle switch for boolean values',
      category: 'inputs',
      props: [
        { name: 'checked', type: 'boolean', default: false, description: 'Switch state' },
      ],
      defaultProps: { checked: false },
    },
  ],
};

// Custom Components - Vue
const customVue: LibraryMeta = {
  id: 'custom-vue',
  name: 'Custom Components (Vue)',
  framework: 'vue',
  description: 'Atlas Universalis custom component library',
  website: 'https://atlasuniversalis.com',
  components: [
    {
      id: 'Card',
      name: 'Card',
      description: 'Container card with border and shadow',
      category: 'layout',
      props: [
        { name: 'class', type: 'class', default: '', description: 'Additional classes' },
        { name: 'hover', type: 'boolean', default: false, description: 'Enable hover effect' },
      ],
      defaultProps: { class: 'bg-night-900 border border-night-800 rounded-xl p-6', hover: true },
    },
    {
      id: 'Badge',
      name: 'Badge',
      description: 'Status badge/pill',
      category: 'feedback',
      props: [
        { name: 'variant', type: 'select', default: 'default', options: ['default', 'success', 'warning', 'error'], description: 'Badge variant' },
        { name: 'text', type: 'string', default: 'Badge', description: 'Badge text' },
      ],
      defaultProps: { variant: 'default', text: 'Badge' },
    },
    {
      id: 'Alert',
      name: 'Alert',
      description: 'Alert/notification message',
      category: 'feedback',
      props: [
        { name: 'type', type: 'select', default: 'info', options: ['info', 'success', 'warning', 'error'], description: 'Alert type' },
        { name: 'title', type: 'string', default: 'Alert Title', description: 'Alert title' },
        { name: 'message', type: 'string', default: 'This is an alert message.', description: 'Alert message' },
      ],
      defaultProps: { type: 'info', title: 'Alert Title', message: 'This is an alert message.' },
    },
    {
      id: 'Button',
      name: 'Button',
      description: 'Styled button component',
      category: 'buttons',
      props: [
        { name: 'variant', type: 'select', default: 'primary', options: ['primary', 'secondary', 'ghost', 'danger'], description: 'Button style' },
        { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg'], description: 'Button size' },
        { name: 'text', type: 'string', default: 'Button', description: 'Button label' },
        { name: 'disabled', type: 'boolean', default: false, description: 'Disable button' },
      ],
      defaultProps: { variant: 'primary', size: 'md', text: 'Button', disabled: false },
    },
    {
      id: 'Input',
      name: 'Text Input',
      description: 'Styled text input field',
      category: 'inputs',
      props: [
        { name: 'placeholder', type: 'string', default: 'Enter text...', description: 'Placeholder text' },
        { name: 'label', type: 'string', default: 'Label', description: 'Input label' },
        { name: 'disabled', type: 'boolean', default: false, description: 'Disable input' },
      ],
      defaultProps: { placeholder: 'Enter text...', label: 'Label', disabled: false },
    },
    {
      id: 'Avatar',
      name: 'Avatar',
      description: 'User avatar/profile image',
      category: 'data',
      props: [
        { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg', 'xl'], description: 'Avatar size' },
        { name: 'initials', type: 'string', default: 'AU', description: 'Fallback initials' },
        { name: 'status', type: 'select', default: 'none', options: ['none', 'online', 'offline', 'busy'], description: 'Status indicator' },
      ],
      defaultProps: { size: 'md', initials: 'AU', status: 'online' },
    },
    {
      id: 'Progress',
      name: 'Progress Bar',
      description: 'Progress indicator bar',
      category: 'feedback',
      props: [
        { name: 'value', type: 'number', default: 60, description: 'Progress percentage (0-100)' },
        { name: 'color', type: 'select', default: 'atlas', options: ['atlas', 'gold', 'green', 'red'], description: 'Bar color' },
        { name: 'showLabel', type: 'boolean', default: true, description: 'Show percentage label' },
      ],
      defaultProps: { value: 60, color: 'atlas', showLabel: true },
    },
    {
      id: 'Tabs',
      name: 'Tab Navigation',
      description: 'Tabbed navigation component',
      category: 'navigation',
      props: [
        { name: 'tabs', type: 'string', default: 'Tab 1,Tab 2,Tab 3', description: 'Comma-separated tab labels' },
        { name: 'activeIndex', type: 'number', default: 0, description: 'Active tab index' },
      ],
      defaultProps: { tabs: 'Tab 1,Tab 2,Tab 3', activeIndex: 0 },
    },
  ],
};

// Custom Components - React
const customReact: LibraryMeta = {
  id: 'custom-react',
  name: 'Custom Components (React)',
  framework: 'react',
  description: 'Atlas Universalis custom component library',
  website: 'https://atlasuniversalis.com',
  components: [
    {
      id: 'Card',
      name: 'Card',
      description: 'Container card with border and shadow',
      category: 'layout',
      props: [
        { name: 'className', type: 'class', default: '', description: 'Additional classes' },
        { name: 'hover', type: 'boolean', default: false, description: 'Enable hover effect' },
      ],
      defaultProps: { className: '', hover: true },
    },
    {
      id: 'Badge',
      name: 'Badge',
      description: 'Status badge/pill',
      category: 'feedback',
      props: [
        { name: 'variant', type: 'select', default: 'default', options: ['default', 'success', 'warning', 'error'], description: 'Badge variant' },
        { name: 'text', type: 'string', default: 'Badge', description: 'Badge text' },
      ],
      defaultProps: { variant: 'default', text: 'Badge' },
    },
    {
      id: 'Alert',
      name: 'Alert',
      description: 'Alert/notification message',
      category: 'feedback',
      props: [
        { name: 'type', type: 'select', default: 'info', options: ['info', 'success', 'warning', 'error'], description: 'Alert type' },
        { name: 'title', type: 'string', default: 'Alert Title', description: 'Alert title' },
        { name: 'message', type: 'string', default: 'This is an alert message.', description: 'Alert message' },
      ],
      defaultProps: { type: 'info', title: 'Alert Title', message: 'This is an alert message.' },
    },
  ],
};

// Export all libraries
export const libraries: LibraryMeta[] = [
  heroiconsVue,
  heroiconsReact,
  headlessVue,
  headlessReact,
  customVue,
  customReact,
];

// Helper to get library by ID
export function getLibrary(id: string): LibraryMeta | undefined {
  return libraries.find(lib => lib.id === id);
}

// Helper to get component by library and component ID
export function getComponent(libraryId: string, componentId: string): ComponentMeta | undefined {
  const library = getLibrary(libraryId);
  return library?.components.find(c => c.id === componentId);
}

// Get all libraries by framework
export function getLibrariesByFramework(framework: 'vue' | 'react'): LibraryMeta[] {
  return libraries.filter(lib => lib.framework === framework);
}

// Get all unique categories
export function getCategories(): string[] {
  const categories = new Set<string>();
  libraries.forEach(lib => {
    lib.components.forEach(c => categories.add(c.category));
  });
  return Array.from(categories);
}
