/**
 * Component Registry - Comprehensive UI component metadata
 * Organized by library and framework
 */

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'class';
  default: any;
  options?: string[];
  description?: string;
}

export interface ComponentMeta {
  id: string;
  name: string;
  description: string;
  props: ComponentProp[];
  defaultProps: Record<string, any>;
  category: 'icons' | 'buttons' | 'inputs' | 'layout' | 'feedback' | 'navigation' | 'data' | 'forms' | 'overlays' | 'typography';
}

export interface LibraryMeta {
  id: string;
  name: string;
  framework: 'vue' | 'react';
  description: string;
  website: string;
  components: ComponentMeta[];
}

// =============================================================================
// HEROICONS - Vue
// =============================================================================
const heroiconsVue: LibraryMeta = {
  id: 'heroicons-vue',
  name: 'Heroicons',
  framework: 'vue',
  description: 'Beautiful hand-crafted SVG icons by Tailwind CSS',
  website: 'https://heroicons.com',
  components: [
    { id: 'ArrowRightIcon', name: 'Arrow Right', description: 'Right-pointing arrow', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'ArrowLeftIcon', name: 'Arrow Left', description: 'Left-pointing arrow', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'ArrowUpIcon', name: 'Arrow Up', description: 'Up-pointing arrow', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'ArrowDownIcon', name: 'Arrow Down', description: 'Down-pointing arrow', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'CheckIcon', name: 'Check', description: 'Checkmark icon', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-green-500' } },
    { id: 'CheckCircleIcon', name: 'Check Circle', description: 'Checkmark in circle', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-green-500' } },
    { id: 'XMarkIcon', name: 'X Mark', description: 'Close/X icon', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-red-500' } },
    { id: 'XCircleIcon', name: 'X Circle', description: 'X in circle', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-red-500' } },
    { id: 'PlusIcon', name: 'Plus', description: 'Add/plus icon', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'MinusIcon', name: 'Minus', description: 'Minus/remove icon', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'BellIcon', name: 'Bell', description: 'Notification bell', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-gold-500' } },
    { id: 'UserIcon', name: 'User', description: 'User profile', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'UsersIcon', name: 'Users', description: 'Multiple users', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'CogIcon', name: 'Settings', description: 'Settings gear', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-night-400' } },
    { id: 'HomeIcon', name: 'Home', description: 'Home icon', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'MagnifyingGlassIcon', name: 'Search', description: 'Search/magnifying glass', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-night-400' } },
    { id: 'HeartIcon', name: 'Heart', description: 'Heart/favorite', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-red-500' } },
    { id: 'StarIcon', name: 'Star', description: 'Star/rating', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-gold-500' } },
    { id: 'TrashIcon', name: 'Trash', description: 'Delete/trash', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-red-500' } },
    { id: 'PencilIcon', name: 'Pencil', description: 'Edit/pencil', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'DocumentIcon', name: 'Document', description: 'Document/file', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'FolderIcon', name: 'Folder', description: 'Folder', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-gold-500' } },
    { id: 'PhotoIcon', name: 'Photo', description: 'Image/photo', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'PlayIcon', name: 'Play', description: 'Play button', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'PauseIcon', name: 'Pause', description: 'Pause button', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'LockClosedIcon', name: 'Lock', description: 'Locked/secure', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'ShieldCheckIcon', name: 'Shield Check', description: 'Security verified', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-green-500' } },
    { id: 'ChartBarIcon', name: 'Chart Bar', description: 'Bar chart', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'ClockIcon', name: 'Clock', description: 'Time/clock', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
    { id: 'CalendarIcon', name: 'Calendar', description: 'Calendar/date', category: 'icons', props: [{ name: 'class', type: 'class', default: 'w-6 h-6' }], defaultProps: { class: 'w-6 h-6 text-atlas-400' } },
  ],
};

// =============================================================================
// HEROICONS - React
// =============================================================================
const heroiconsReact: LibraryMeta = {
  id: 'heroicons-react',
  name: 'Heroicons',
  framework: 'react',
  description: 'Beautiful hand-crafted SVG icons by Tailwind CSS',
  website: 'https://heroicons.com',
  components: heroiconsVue.components.map(c => ({
    ...c,
    props: [{ name: 'className', type: 'class' as const, default: 'w-6 h-6' }],
    defaultProps: { className: c.defaultProps.class },
  })),
};

// =============================================================================
// VUETIFY (Vue) - Material Design
// =============================================================================
const vuetify: LibraryMeta = {
  id: 'vuetify',
  name: 'Vuetify',
  framework: 'vue',
  description: 'Material Design component framework for Vue',
  website: 'https://vuetifyjs.com',
  components: [
    { id: 'VBtn', name: 'Button', description: 'Material button with ripple', category: 'buttons', props: [
      { name: 'color', type: 'select', default: 'primary', options: ['primary', 'secondary', 'success', 'error', 'warning', 'info'] },
      { name: 'variant', type: 'select', default: 'elevated', options: ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'] },
      { name: 'size', type: 'select', default: 'default', options: ['x-small', 'small', 'default', 'large', 'x-large'] },
      { name: 'rounded', type: 'select', default: 'default', options: ['0', 'sm', 'default', 'lg', 'xl', 'pill'] },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'loading', type: 'boolean', default: false },
    ], defaultProps: { color: 'primary', variant: 'elevated', size: 'default', rounded: 'default', disabled: false, loading: false } },
    { id: 'VCard', name: 'Card', description: 'Material card container', category: 'layout', props: [
      { name: 'elevation', type: 'number', default: 2 },
      { name: 'rounded', type: 'select', default: 'default', options: ['0', 'sm', 'default', 'lg', 'xl'] },
      { name: 'color', type: 'string', default: '' },
    ], defaultProps: { elevation: 2, rounded: 'default', color: '' } },
    { id: 'VTextField', name: 'Text Field', description: 'Material text input', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Label' },
      { name: 'variant', type: 'select', default: 'filled', options: ['underlined', 'outlined', 'filled', 'solo', 'plain'] },
      { name: 'density', type: 'select', default: 'default', options: ['default', 'comfortable', 'compact'] },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'clearable', type: 'boolean', default: false },
    ], defaultProps: { label: 'Label', variant: 'filled', density: 'default', disabled: false, clearable: false } },
    { id: 'VSelect', name: 'Select', description: 'Material dropdown select', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Select' },
      { name: 'variant', type: 'select', default: 'filled', options: ['underlined', 'outlined', 'filled', 'solo', 'plain'] },
      { name: 'multiple', type: 'boolean', default: false },
      { name: 'chips', type: 'boolean', default: false },
    ], defaultProps: { label: 'Select', variant: 'filled', multiple: false, chips: false } },
    { id: 'VCheckbox', name: 'Checkbox', description: 'Material checkbox', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Checkbox' },
      { name: 'color', type: 'select', default: 'primary', options: ['primary', 'secondary', 'success', 'error'] },
      { name: 'disabled', type: 'boolean', default: false },
    ], defaultProps: { label: 'Checkbox', color: 'primary', disabled: false } },
    { id: 'VSwitch', name: 'Switch', description: 'Material toggle switch', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Switch' },
      { name: 'color', type: 'select', default: 'primary', options: ['primary', 'secondary', 'success', 'error'] },
      { name: 'inset', type: 'boolean', default: false },
    ], defaultProps: { label: 'Switch', color: 'primary', inset: false } },
    { id: 'VSlider', name: 'Slider', description: 'Material range slider', category: 'inputs', props: [
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'step', type: 'number', default: 1 },
      { name: 'thumbLabel', type: 'boolean', default: true },
    ], defaultProps: { min: 0, max: 100, step: 1, thumbLabel: true } },
    { id: 'VChip', name: 'Chip', description: 'Material chip/tag', category: 'data', props: [
      { name: 'color', type: 'select', default: 'primary', options: ['primary', 'secondary', 'success', 'error', 'warning', 'info'] },
      { name: 'size', type: 'select', default: 'default', options: ['x-small', 'small', 'default', 'large', 'x-large'] },
      { name: 'closable', type: 'boolean', default: false },
      { name: 'label', type: 'boolean', default: false },
    ], defaultProps: { color: 'primary', size: 'default', closable: false, label: false } },
    { id: 'VAlert', name: 'Alert', description: 'Material alert message', category: 'feedback', props: [
      { name: 'type', type: 'select', default: 'info', options: ['success', 'info', 'warning', 'error'] },
      { name: 'title', type: 'string', default: 'Alert' },
      { name: 'text', type: 'string', default: 'This is an alert message.' },
      { name: 'closable', type: 'boolean', default: false },
      { name: 'variant', type: 'select', default: 'flat', options: ['flat', 'elevated', 'tonal', 'outlined', 'text', 'plain'] },
    ], defaultProps: { type: 'info', title: 'Alert', text: 'This is an alert message.', closable: false, variant: 'flat' } },
    { id: 'VProgressLinear', name: 'Progress Bar', description: 'Linear progress indicator', category: 'feedback', props: [
      { name: 'modelValue', type: 'number', default: 50 },
      { name: 'color', type: 'select', default: 'primary', options: ['primary', 'secondary', 'success', 'error'] },
      { name: 'indeterminate', type: 'boolean', default: false },
      { name: 'striped', type: 'boolean', default: false },
    ], defaultProps: { modelValue: 50, color: 'primary', indeterminate: false, striped: false } },
    { id: 'VProgressCircular', name: 'Progress Circular', description: 'Circular progress indicator', category: 'feedback', props: [
      { name: 'modelValue', type: 'number', default: 50 },
      { name: 'color', type: 'select', default: 'primary', options: ['primary', 'secondary', 'success', 'error'] },
      { name: 'size', type: 'number', default: 48 },
      { name: 'indeterminate', type: 'boolean', default: false },
    ], defaultProps: { modelValue: 50, color: 'primary', size: 48, indeterminate: false } },
    { id: 'VAvatar', name: 'Avatar', description: 'User avatar', category: 'data', props: [
      { name: 'size', type: 'select', default: 'default', options: ['x-small', 'small', 'default', 'large', 'x-large'] },
      { name: 'color', type: 'string', default: 'primary' },
      { name: 'rounded', type: 'boolean', default: true },
    ], defaultProps: { size: 'default', color: 'primary', rounded: true } },
    { id: 'VBadge', name: 'Badge', description: 'Badge indicator', category: 'data', props: [
      { name: 'content', type: 'string', default: '5' },
      { name: 'color', type: 'select', default: 'error', options: ['primary', 'secondary', 'success', 'error'] },
      { name: 'dot', type: 'boolean', default: false },
    ], defaultProps: { content: '5', color: 'error', dot: false } },
    { id: 'VTabs', name: 'Tabs', description: 'Material tabs', category: 'navigation', props: [
      { name: 'color', type: 'select', default: 'primary', options: ['primary', 'secondary', 'success', 'error'] },
      { name: 'grow', type: 'boolean', default: false },
      { name: 'centered', type: 'boolean', default: false },
    ], defaultProps: { color: 'primary', grow: false, centered: false } },
    { id: 'VAppBar', name: 'App Bar', description: 'Top application bar', category: 'navigation', props: [
      { name: 'color', type: 'string', default: 'primary' },
      { name: 'elevation', type: 'number', default: 4 },
      { name: 'density', type: 'select', default: 'default', options: ['default', 'comfortable', 'compact'] },
    ], defaultProps: { color: 'primary', elevation: 4, density: 'default' } },
    { id: 'VNavigationDrawer', name: 'Navigation Drawer', description: 'Side navigation', category: 'navigation', props: [
      { name: 'rail', type: 'boolean', default: false },
      { name: 'permanent', type: 'boolean', default: false },
      { name: 'location', type: 'select', default: 'start', options: ['start', 'end'] },
    ], defaultProps: { rail: false, permanent: false, location: 'start' } },
    { id: 'VDialog', name: 'Dialog', description: 'Modal dialog', category: 'overlays', props: [
      { name: 'width', type: 'string', default: '500' },
      { name: 'persistent', type: 'boolean', default: false },
      { name: 'fullscreen', type: 'boolean', default: false },
    ], defaultProps: { width: '500', persistent: false, fullscreen: false } },
    { id: 'VMenu', name: 'Menu', description: 'Dropdown menu', category: 'overlays', props: [
      { name: 'location', type: 'select', default: 'bottom', options: ['top', 'bottom', 'start', 'end'] },
      { name: 'closeOnContentClick', type: 'boolean', default: true },
    ], defaultProps: { location: 'bottom', closeOnContentClick: true } },
    { id: 'VTooltip', name: 'Tooltip', description: 'Hover tooltip', category: 'overlays', props: [
      { name: 'text', type: 'string', default: 'Tooltip' },
      { name: 'location', type: 'select', default: 'top', options: ['top', 'bottom', 'start', 'end'] },
    ], defaultProps: { text: 'Tooltip', location: 'top' } },
    { id: 'VDataTable', name: 'Data Table', description: 'Feature-rich data table', category: 'data', props: [
      { name: 'density', type: 'select', default: 'default', options: ['default', 'comfortable', 'compact'] },
      { name: 'hover', type: 'boolean', default: true },
      { name: 'fixedHeader', type: 'boolean', default: false },
    ], defaultProps: { density: 'default', hover: true, fixedHeader: false } },
    { id: 'VList', name: 'List', description: 'Material list', category: 'data', props: [
      { name: 'lines', type: 'select', default: 'one', options: ['one', 'two', 'three'] },
      { name: 'nav', type: 'boolean', default: false },
      { name: 'density', type: 'select', default: 'default', options: ['default', 'comfortable', 'compact'] },
    ], defaultProps: { lines: 'one', nav: false, density: 'default' } },
  ],
};

// =============================================================================
// PRIMEVUE (Vue) - Rich UI Components
// =============================================================================
const primevue: LibraryMeta = {
  id: 'primevue',
  name: 'PrimeVue',
  framework: 'vue',
  description: 'Rich set of open source UI components for Vue',
  website: 'https://primevue.org',
  components: [
    { id: 'Button', name: 'Button', description: 'Button component', category: 'buttons', props: [
      { name: 'label', type: 'string', default: 'Button' },
      { name: 'severity', type: 'select', default: 'primary', options: ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'help', 'contrast'] },
      { name: 'outlined', type: 'boolean', default: false },
      { name: 'rounded', type: 'boolean', default: false },
      { name: 'raised', type: 'boolean', default: false },
      { name: 'size', type: 'select', default: 'normal', options: ['small', 'normal', 'large'] },
    ], defaultProps: { label: 'Button', severity: 'primary', outlined: false, rounded: false, raised: false, size: 'normal' } },
    { id: 'InputText', name: 'Input Text', description: 'Text input field', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Enter text' },
      { name: 'size', type: 'select', default: 'normal', options: ['small', 'normal', 'large'] },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'invalid', type: 'boolean', default: false },
    ], defaultProps: { placeholder: 'Enter text', size: 'normal', disabled: false, invalid: false } },
    { id: 'InputNumber', name: 'Input Number', description: 'Numeric input with spinner', category: 'inputs', props: [
      { name: 'mode', type: 'select', default: 'decimal', options: ['decimal', 'currency'] },
      { name: 'showButtons', type: 'boolean', default: true },
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
    ], defaultProps: { mode: 'decimal', showButtons: true, min: 0, max: 100 } },
    { id: 'Dropdown', name: 'Dropdown', description: 'Dropdown select', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Select' },
      { name: 'filter', type: 'boolean', default: false },
      { name: 'showClear', type: 'boolean', default: false },
    ], defaultProps: { placeholder: 'Select', filter: false, showClear: false } },
    { id: 'MultiSelect', name: 'MultiSelect', description: 'Multiple selection dropdown', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Select Items' },
      { name: 'filter', type: 'boolean', default: true },
      { name: 'display', type: 'select', default: 'comma', options: ['comma', 'chip'] },
    ], defaultProps: { placeholder: 'Select Items', filter: true, display: 'comma' } },
    { id: 'Calendar', name: 'Calendar', description: 'Date picker', category: 'inputs', props: [
      { name: 'showIcon', type: 'boolean', default: true },
      { name: 'showTime', type: 'boolean', default: false },
      { name: 'inline', type: 'boolean', default: false },
    ], defaultProps: { showIcon: true, showTime: false, inline: false } },
    { id: 'Checkbox', name: 'Checkbox', description: 'Checkbox input', category: 'inputs', props: [
      { name: 'binary', type: 'boolean', default: true },
      { name: 'disabled', type: 'boolean', default: false },
    ], defaultProps: { binary: true, disabled: false } },
    { id: 'RadioButton', name: 'Radio Button', description: 'Radio button input', category: 'inputs', props: [
      { name: 'disabled', type: 'boolean', default: false },
    ], defaultProps: { disabled: false } },
    { id: 'Slider', name: 'Slider', description: 'Range slider', category: 'inputs', props: [
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'range', type: 'boolean', default: false },
      { name: 'orientation', type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'] },
    ], defaultProps: { min: 0, max: 100, range: false, orientation: 'horizontal' } },
    { id: 'Card', name: 'Card', description: 'Content container card', category: 'layout', props: [], defaultProps: {} },
    { id: 'Panel', name: 'Panel', description: 'Collapsible panel', category: 'layout', props: [
      { name: 'header', type: 'string', default: 'Panel Header' },
      { name: 'toggleable', type: 'boolean', default: true },
      { name: 'collapsed', type: 'boolean', default: false },
    ], defaultProps: { header: 'Panel Header', toggleable: true, collapsed: false } },
    { id: 'Accordion', name: 'Accordion', description: 'Accordion container', category: 'layout', props: [
      { name: 'multiple', type: 'boolean', default: false },
    ], defaultProps: { multiple: false } },
    { id: 'TabView', name: 'Tab View', description: 'Tabbed content', category: 'navigation', props: [
      { name: 'scrollable', type: 'boolean', default: false },
    ], defaultProps: { scrollable: false } },
    { id: 'Menubar', name: 'Menubar', description: 'Horizontal menu bar', category: 'navigation', props: [], defaultProps: {} },
    { id: 'Breadcrumb', name: 'Breadcrumb', description: 'Breadcrumb navigation', category: 'navigation', props: [], defaultProps: {} },
    { id: 'Steps', name: 'Steps', description: 'Step indicator', category: 'navigation', props: [
      { name: 'readonly', type: 'boolean', default: false },
    ], defaultProps: { readonly: false } },
    { id: 'DataTable', name: 'DataTable', description: 'Advanced data table', category: 'data', props: [
      { name: 'paginator', type: 'boolean', default: true },
      { name: 'rows', type: 'number', default: 10 },
      { name: 'sortable', type: 'boolean', default: true },
      { name: 'stripedRows', type: 'boolean', default: false },
    ], defaultProps: { paginator: true, rows: 10, sortable: true, stripedRows: false } },
    { id: 'Tree', name: 'Tree', description: 'Hierarchical tree view', category: 'data', props: [
      { name: 'filter', type: 'boolean', default: false },
      { name: 'selectionMode', type: 'select', default: 'single', options: ['single', 'multiple', 'checkbox'] },
    ], defaultProps: { filter: false, selectionMode: 'single' } },
    { id: 'Tag', name: 'Tag', description: 'Tag/badge', category: 'data', props: [
      { name: 'value', type: 'string', default: 'Tag' },
      { name: 'severity', type: 'select', default: 'primary', options: ['primary', 'success', 'info', 'warning', 'danger', 'secondary', 'contrast'] },
      { name: 'rounded', type: 'boolean', default: false },
    ], defaultProps: { value: 'Tag', severity: 'primary', rounded: false } },
    { id: 'Avatar', name: 'Avatar', description: 'User avatar', category: 'data', props: [
      { name: 'label', type: 'string', default: 'A' },
      { name: 'size', type: 'select', default: 'normal', options: ['normal', 'large', 'xlarge'] },
      { name: 'shape', type: 'select', default: 'circle', options: ['square', 'circle'] },
    ], defaultProps: { label: 'A', size: 'normal', shape: 'circle' } },
    { id: 'ProgressBar', name: 'Progress Bar', description: 'Progress indicator', category: 'feedback', props: [
      { name: 'value', type: 'number', default: 50 },
      { name: 'showValue', type: 'boolean', default: true },
      { name: 'mode', type: 'select', default: 'determinate', options: ['determinate', 'indeterminate'] },
    ], defaultProps: { value: 50, showValue: true, mode: 'determinate' } },
    { id: 'ProgressSpinner', name: 'Spinner', description: 'Loading spinner', category: 'feedback', props: [
      { name: 'strokeWidth', type: 'string', default: '4' },
    ], defaultProps: { strokeWidth: '4' } },
    { id: 'Toast', name: 'Toast', description: 'Toast notification', category: 'feedback', props: [
      { name: 'position', type: 'select', default: 'top-right', options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] },
    ], defaultProps: { position: 'top-right' } },
    { id: 'Message', name: 'Message', description: 'Inline message', category: 'feedback', props: [
      { name: 'severity', type: 'select', default: 'info', options: ['success', 'info', 'warn', 'error', 'secondary', 'contrast'] },
      { name: 'text', type: 'string', default: 'Message text' },
      { name: 'closable', type: 'boolean', default: true },
    ], defaultProps: { severity: 'info', text: 'Message text', closable: true } },
    { id: 'Dialog', name: 'Dialog', description: 'Modal dialog', category: 'overlays', props: [
      { name: 'header', type: 'string', default: 'Dialog' },
      { name: 'modal', type: 'boolean', default: true },
      { name: 'draggable', type: 'boolean', default: false },
      { name: 'closable', type: 'boolean', default: true },
    ], defaultProps: { header: 'Dialog', modal: true, draggable: false, closable: true } },
    { id: 'ConfirmDialog', name: 'Confirm Dialog', description: 'Confirmation dialog', category: 'overlays', props: [], defaultProps: {} },
    { id: 'Sidebar', name: 'Sidebar', description: 'Side panel overlay', category: 'overlays', props: [
      { name: 'position', type: 'select', default: 'right', options: ['left', 'right', 'top', 'bottom'] },
    ], defaultProps: { position: 'right' } },
    { id: 'Tooltip', name: 'Tooltip', description: 'Hover tooltip', category: 'overlays', props: [
      { name: 'value', type: 'string', default: 'Tooltip' },
      { name: 'position', type: 'select', default: 'top', options: ['top', 'bottom', 'left', 'right'] },
    ], defaultProps: { value: 'Tooltip', position: 'top' } },
  ],
};

// =============================================================================
// NAIVE UI (Vue) - Modern Components
// =============================================================================
const naiveui: LibraryMeta = {
  id: 'naiveui',
  name: 'Naive UI',
  framework: 'vue',
  description: 'A Vue 3 component library with TypeScript support',
  website: 'https://naiveui.com',
  components: [
    { id: 'NButton', name: 'Button', description: 'Button component', category: 'buttons', props: [
      { name: 'type', type: 'select', default: 'default', options: ['default', 'primary', 'info', 'success', 'warning', 'error'] },
      { name: 'size', type: 'select', default: 'medium', options: ['tiny', 'small', 'medium', 'large'] },
      { name: 'ghost', type: 'boolean', default: false },
      { name: 'dashed', type: 'boolean', default: false },
      { name: 'round', type: 'boolean', default: false },
      { name: 'circle', type: 'boolean', default: false },
    ], defaultProps: { type: 'default', size: 'medium', ghost: false, dashed: false, round: false, circle: false } },
    { id: 'NInput', name: 'Input', description: 'Text input', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Enter text' },
      { name: 'type', type: 'select', default: 'text', options: ['text', 'password', 'textarea'] },
      { name: 'size', type: 'select', default: 'medium', options: ['tiny', 'small', 'medium', 'large'] },
      { name: 'clearable', type: 'boolean', default: false },
      { name: 'round', type: 'boolean', default: false },
    ], defaultProps: { placeholder: 'Enter text', type: 'text', size: 'medium', clearable: false, round: false } },
    { id: 'NSelect', name: 'Select', description: 'Dropdown select', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Select' },
      { name: 'multiple', type: 'boolean', default: false },
      { name: 'filterable', type: 'boolean', default: false },
      { name: 'clearable', type: 'boolean', default: false },
    ], defaultProps: { placeholder: 'Select', multiple: false, filterable: false, clearable: false } },
    { id: 'NDatePicker', name: 'Date Picker', description: 'Date selection', category: 'inputs', props: [
      { name: 'type', type: 'select', default: 'date', options: ['date', 'datetime', 'daterange', 'month', 'year'] },
      { name: 'clearable', type: 'boolean', default: true },
    ], defaultProps: { type: 'date', clearable: true } },
    { id: 'NTimePicker', name: 'Time Picker', description: 'Time selection', category: 'inputs', props: [
      { name: 'clearable', type: 'boolean', default: true },
    ], defaultProps: { clearable: true } },
    { id: 'NSwitch', name: 'Switch', description: 'Toggle switch', category: 'inputs', props: [
      { name: 'size', type: 'select', default: 'medium', options: ['small', 'medium', 'large'] },
      { name: 'round', type: 'boolean', default: true },
    ], defaultProps: { size: 'medium', round: true } },
    { id: 'NSlider', name: 'Slider', description: 'Range slider', category: 'inputs', props: [
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'range', type: 'boolean', default: false },
      { name: 'tooltip', type: 'boolean', default: true },
    ], defaultProps: { min: 0, max: 100, range: false, tooltip: true } },
    { id: 'NRate', name: 'Rate', description: 'Star rating', category: 'inputs', props: [
      { name: 'count', type: 'number', default: 5 },
      { name: 'allowHalf', type: 'boolean', default: false },
    ], defaultProps: { count: 5, allowHalf: false } },
    { id: 'NCard', name: 'Card', description: 'Card container', category: 'layout', props: [
      { name: 'title', type: 'string', default: 'Card Title' },
      { name: 'bordered', type: 'boolean', default: true },
      { name: 'hoverable', type: 'boolean', default: false },
    ], defaultProps: { title: 'Card Title', bordered: true, hoverable: false } },
    { id: 'NCollapse', name: 'Collapse', description: 'Collapsible panel', category: 'layout', props: [
      { name: 'accordion', type: 'boolean', default: false },
    ], defaultProps: { accordion: false } },
    { id: 'NTabs', name: 'Tabs', description: 'Tab navigation', category: 'navigation', props: [
      { name: 'type', type: 'select', default: 'line', options: ['line', 'card', 'segment', 'bar'] },
      { name: 'size', type: 'select', default: 'medium', options: ['small', 'medium', 'large'] },
    ], defaultProps: { type: 'line', size: 'medium' } },
    { id: 'NMenu', name: 'Menu', description: 'Navigation menu', category: 'navigation', props: [
      { name: 'mode', type: 'select', default: 'vertical', options: ['vertical', 'horizontal'] },
      { name: 'collapsed', type: 'boolean', default: false },
    ], defaultProps: { mode: 'vertical', collapsed: false } },
    { id: 'NBreadcrumb', name: 'Breadcrumb', description: 'Breadcrumb navigation', category: 'navigation', props: [], defaultProps: {} },
    { id: 'NPagination', name: 'Pagination', description: 'Page navigation', category: 'navigation', props: [
      { name: 'pageCount', type: 'number', default: 10 },
      { name: 'showSizePicker', type: 'boolean', default: false },
    ], defaultProps: { pageCount: 10, showSizePicker: false } },
    { id: 'NDataTable', name: 'Data Table', description: 'Advanced data table', category: 'data', props: [
      { name: 'bordered', type: 'boolean', default: true },
      { name: 'singleLine', type: 'boolean', default: true },
      { name: 'striped', type: 'boolean', default: false },
    ], defaultProps: { bordered: true, singleLine: true, striped: false } },
    { id: 'NTree', name: 'Tree', description: 'Tree structure', category: 'data', props: [
      { name: 'selectable', type: 'boolean', default: true },
      { name: 'checkable', type: 'boolean', default: false },
      { name: 'draggable', type: 'boolean', default: false },
    ], defaultProps: { selectable: true, checkable: false, draggable: false } },
    { id: 'NTag', name: 'Tag', description: 'Tag/label', category: 'data', props: [
      { name: 'type', type: 'select', default: 'default', options: ['default', 'primary', 'info', 'success', 'warning', 'error'] },
      { name: 'size', type: 'select', default: 'medium', options: ['small', 'medium', 'large'] },
      { name: 'closable', type: 'boolean', default: false },
      { name: 'round', type: 'boolean', default: false },
    ], defaultProps: { type: 'default', size: 'medium', closable: false, round: false } },
    { id: 'NAvatar', name: 'Avatar', description: 'User avatar', category: 'data', props: [
      { name: 'size', type: 'select', default: 'medium', options: ['small', 'medium', 'large'] },
      { name: 'round', type: 'boolean', default: true },
    ], defaultProps: { size: 'medium', round: true } },
    { id: 'NProgress', name: 'Progress', description: 'Progress indicator', category: 'feedback', props: [
      { name: 'type', type: 'select', default: 'line', options: ['line', 'circle', 'multiple-circle'] },
      { name: 'percentage', type: 'number', default: 50 },
      { name: 'status', type: 'select', default: 'default', options: ['default', 'success', 'error', 'warning', 'info'] },
    ], defaultProps: { type: 'line', percentage: 50, status: 'default' } },
    { id: 'NSpin', name: 'Spin', description: 'Loading spinner', category: 'feedback', props: [
      { name: 'size', type: 'select', default: 'medium', options: ['small', 'medium', 'large'] },
    ], defaultProps: { size: 'medium' } },
    { id: 'NAlert', name: 'Alert', description: 'Alert message', category: 'feedback', props: [
      { name: 'type', type: 'select', default: 'default', options: ['default', 'info', 'success', 'warning', 'error'] },
      { name: 'title', type: 'string', default: 'Alert' },
      { name: 'closable', type: 'boolean', default: false },
    ], defaultProps: { type: 'default', title: 'Alert', closable: false } },
    { id: 'NModal', name: 'Modal', description: 'Modal dialog', category: 'overlays', props: [
      { name: 'title', type: 'string', default: 'Modal' },
      { name: 'preset', type: 'select', default: 'card', options: ['dialog', 'card'] },
    ], defaultProps: { title: 'Modal', preset: 'card' } },
    { id: 'NDrawer', name: 'Drawer', description: 'Slide-out drawer', category: 'overlays', props: [
      { name: 'placement', type: 'select', default: 'right', options: ['top', 'right', 'bottom', 'left'] },
      { name: 'width', type: 'number', default: 300 },
    ], defaultProps: { placement: 'right', width: 300 } },
    { id: 'NTooltip', name: 'Tooltip', description: 'Hover tooltip', category: 'overlays', props: [
      { name: 'trigger', type: 'select', default: 'hover', options: ['hover', 'click', 'focus', 'manual'] },
      { name: 'placement', type: 'select', default: 'top', options: ['top', 'bottom', 'left', 'right'] },
    ], defaultProps: { trigger: 'hover', placement: 'top' } },
    { id: 'NPopover', name: 'Popover', description: 'Popover content', category: 'overlays', props: [
      { name: 'trigger', type: 'select', default: 'click', options: ['hover', 'click', 'focus', 'manual'] },
      { name: 'placement', type: 'select', default: 'top', options: ['top', 'bottom', 'left', 'right'] },
    ], defaultProps: { trigger: 'click', placement: 'top' } },
  ],
};

// =============================================================================
// CHAKRA UI (React) - Accessible Components
// =============================================================================
const chakraui: LibraryMeta = {
  id: 'chakraui',
  name: 'Chakra UI',
  framework: 'react',
  description: 'Simple, modular and accessible React components',
  website: 'https://chakra-ui.com',
  components: [
    { id: 'Button', name: 'Button', description: 'Accessible button', category: 'buttons', props: [
      { name: 'colorScheme', type: 'select', default: 'blue', options: ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink'] },
      { name: 'variant', type: 'select', default: 'solid', options: ['solid', 'outline', 'ghost', 'link'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg'] },
      { name: 'isLoading', type: 'boolean', default: false },
      { name: 'isDisabled', type: 'boolean', default: false },
    ], defaultProps: { colorScheme: 'blue', variant: 'solid', size: 'md', isLoading: false, isDisabled: false } },
    { id: 'IconButton', name: 'Icon Button', description: 'Icon-only button', category: 'buttons', props: [
      { name: 'colorScheme', type: 'select', default: 'blue', options: ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink'] },
      { name: 'variant', type: 'select', default: 'solid', options: ['solid', 'outline', 'ghost', 'link'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg'] },
      { name: 'isRound', type: 'boolean', default: false },
    ], defaultProps: { colorScheme: 'blue', variant: 'solid', size: 'md', isRound: false } },
    { id: 'Input', name: 'Input', description: 'Text input', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Enter text' },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg'] },
      { name: 'variant', type: 'select', default: 'outline', options: ['outline', 'filled', 'flushed', 'unstyled'] },
      { name: 'isDisabled', type: 'boolean', default: false },
      { name: 'isInvalid', type: 'boolean', default: false },
    ], defaultProps: { placeholder: 'Enter text', size: 'md', variant: 'outline', isDisabled: false, isInvalid: false } },
    { id: 'NumberInput', name: 'Number Input', description: 'Numeric input', category: 'inputs', props: [
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'step', type: 'number', default: 1 },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg'] },
    ], defaultProps: { min: 0, max: 100, step: 1, size: 'md' } },
    { id: 'Textarea', name: 'Textarea', description: 'Multi-line text input', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Enter text' },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg'] },
      { name: 'resize', type: 'select', default: 'vertical', options: ['none', 'vertical', 'horizontal', 'both'] },
    ], defaultProps: { placeholder: 'Enter text', size: 'md', resize: 'vertical' } },
    { id: 'Select', name: 'Select', description: 'Dropdown select', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Select option' },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg'] },
      { name: 'variant', type: 'select', default: 'outline', options: ['outline', 'filled', 'flushed', 'unstyled'] },
    ], defaultProps: { placeholder: 'Select option', size: 'md', variant: 'outline' } },
    { id: 'Checkbox', name: 'Checkbox', description: 'Checkbox input', category: 'inputs', props: [
      { name: 'colorScheme', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'purple', 'pink'] },
      { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg'] },
      { name: 'isDisabled', type: 'boolean', default: false },
    ], defaultProps: { colorScheme: 'blue', size: 'md', isDisabled: false } },
    { id: 'Radio', name: 'Radio', description: 'Radio button', category: 'inputs', props: [
      { name: 'colorScheme', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'purple', 'pink'] },
      { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg'] },
    ], defaultProps: { colorScheme: 'blue', size: 'md' } },
    { id: 'Switch', name: 'Switch', description: 'Toggle switch', category: 'inputs', props: [
      { name: 'colorScheme', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'purple', 'pink'] },
      { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg'] },
    ], defaultProps: { colorScheme: 'blue', size: 'md' } },
    { id: 'Slider', name: 'Slider', description: 'Range slider', category: 'inputs', props: [
      { name: 'colorScheme', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'purple', 'pink'] },
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
    ], defaultProps: { colorScheme: 'blue', min: 0, max: 100 } },
    { id: 'PinInput', name: 'Pin Input', description: 'PIN/OTP input', category: 'inputs', props: [
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg'] },
      { name: 'type', type: 'select', default: 'number', options: ['number', 'alphanumeric'] },
    ], defaultProps: { size: 'md', type: 'number' } },
    { id: 'Card', name: 'Card', description: 'Card container', category: 'layout', props: [
      { name: 'variant', type: 'select', default: 'elevated', options: ['elevated', 'outline', 'filled', 'unstyled'] },
      { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg'] },
    ], defaultProps: { variant: 'elevated', size: 'md' } },
    { id: 'Box', name: 'Box', description: 'Base layout component', category: 'layout', props: [
      { name: 'p', type: 'number', default: 4 },
      { name: 'bg', type: 'string', default: 'gray.100' },
      { name: 'borderRadius', type: 'string', default: 'md' },
    ], defaultProps: { p: 4, bg: 'gray.100', borderRadius: 'md' } },
    { id: 'Flex', name: 'Flex', description: 'Flexbox container', category: 'layout', props: [
      { name: 'direction', type: 'select', default: 'row', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
      { name: 'justify', type: 'select', default: 'flex-start', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'] },
      { name: 'align', type: 'select', default: 'stretch', options: ['stretch', 'flex-start', 'center', 'flex-end'] },
      { name: 'gap', type: 'number', default: 2 },
    ], defaultProps: { direction: 'row', justify: 'flex-start', align: 'stretch', gap: 2 } },
    { id: 'Grid', name: 'Grid', description: 'CSS Grid container', category: 'layout', props: [
      { name: 'templateColumns', type: 'string', default: 'repeat(3, 1fr)' },
      { name: 'gap', type: 'number', default: 4 },
    ], defaultProps: { templateColumns: 'repeat(3, 1fr)', gap: 4 } },
    { id: 'Stack', name: 'Stack', description: 'Stacked elements', category: 'layout', props: [
      { name: 'direction', type: 'select', default: 'column', options: ['row', 'column'] },
      { name: 'spacing', type: 'number', default: 4 },
    ], defaultProps: { direction: 'column', spacing: 4 } },
    { id: 'Divider', name: 'Divider', description: 'Horizontal/vertical divider', category: 'layout', props: [
      { name: 'orientation', type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'] },
    ], defaultProps: { orientation: 'horizontal' } },
    { id: 'Tabs', name: 'Tabs', description: 'Tab navigation', category: 'navigation', props: [
      { name: 'variant', type: 'select', default: 'line', options: ['line', 'enclosed', 'enclosed-colored', 'soft-rounded', 'solid-rounded'] },
      { name: 'colorScheme', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'purple', 'pink'] },
      { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg'] },
    ], defaultProps: { variant: 'line', colorScheme: 'blue', size: 'md' } },
    { id: 'Breadcrumb', name: 'Breadcrumb', description: 'Breadcrumb navigation', category: 'navigation', props: [
      { name: 'separator', type: 'string', default: '/' },
    ], defaultProps: { separator: '/' } },
    { id: 'Link', name: 'Link', description: 'Anchor link', category: 'navigation', props: [
      { name: 'isExternal', type: 'boolean', default: false },
    ], defaultProps: { isExternal: false } },
    { id: 'Stepper', name: 'Stepper', description: 'Step indicator', category: 'navigation', props: [
      { name: 'colorScheme', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'purple', 'pink'] },
      { name: 'orientation', type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'] },
    ], defaultProps: { colorScheme: 'blue', orientation: 'horizontal' } },
    { id: 'Table', name: 'Table', description: 'Data table', category: 'data', props: [
      { name: 'variant', type: 'select', default: 'simple', options: ['simple', 'striped', 'unstyled'] },
      { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg'] },
      { name: 'colorScheme', type: 'select', default: 'gray', options: ['gray', 'red', 'green', 'blue', 'purple', 'pink'] },
    ], defaultProps: { variant: 'simple', size: 'md', colorScheme: 'gray' } },
    { id: 'Tag', name: 'Tag', description: 'Tag/badge', category: 'data', props: [
      { name: 'colorScheme', type: 'select', default: 'gray', options: ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink'] },
      { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg'] },
      { name: 'variant', type: 'select', default: 'subtle', options: ['subtle', 'solid', 'outline'] },
    ], defaultProps: { colorScheme: 'gray', size: 'md', variant: 'subtle' } },
    { id: 'Badge', name: 'Badge', description: 'Badge indicator', category: 'data', props: [
      { name: 'colorScheme', type: 'select', default: 'gray', options: ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink'] },
      { name: 'variant', type: 'select', default: 'subtle', options: ['subtle', 'solid', 'outline'] },
    ], defaultProps: { colorScheme: 'gray', variant: 'subtle' } },
    { id: 'Avatar', name: 'Avatar', description: 'User avatar', category: 'data', props: [
      { name: 'name', type: 'string', default: 'John Doe' },
      { name: 'size', type: 'select', default: 'md', options: ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    ], defaultProps: { name: 'John Doe', size: 'md' } },
    { id: 'Stat', name: 'Stat', description: 'Statistic display', category: 'data', props: [], defaultProps: {} },
    { id: 'Code', name: 'Code', description: 'Inline code', category: 'data', props: [
      { name: 'colorScheme', type: 'select', default: 'gray', options: ['gray', 'red', 'green', 'blue', 'purple', 'pink'] },
    ], defaultProps: { colorScheme: 'gray' } },
    { id: 'Kbd', name: 'Keyboard', description: 'Keyboard shortcut', category: 'data', props: [], defaultProps: {} },
    { id: 'Progress', name: 'Progress', description: 'Progress bar', category: 'feedback', props: [
      { name: 'value', type: 'number', default: 50 },
      { name: 'colorScheme', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'purple', 'pink'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg'] },
      { name: 'hasStripe', type: 'boolean', default: false },
      { name: 'isAnimated', type: 'boolean', default: false },
    ], defaultProps: { value: 50, colorScheme: 'blue', size: 'md', hasStripe: false, isAnimated: false } },
    { id: 'CircularProgress', name: 'Circular Progress', description: 'Circular progress', category: 'feedback', props: [
      { name: 'value', type: 'number', default: 50 },
      { name: 'color', type: 'string', default: 'blue.400' },
      { name: 'size', type: 'string', default: '120px' },
    ], defaultProps: { value: 50, color: 'blue.400', size: '120px' } },
    { id: 'Spinner', name: 'Spinner', description: 'Loading spinner', category: 'feedback', props: [
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'color', type: 'string', default: 'blue.500' },
      { name: 'thickness', type: 'string', default: '2px' },
    ], defaultProps: { size: 'md', color: 'blue.500', thickness: '2px' } },
    { id: 'Skeleton', name: 'Skeleton', description: 'Loading skeleton', category: 'feedback', props: [
      { name: 'height', type: 'string', default: '20px' },
      { name: 'startColor', type: 'string', default: 'gray.100' },
      { name: 'endColor', type: 'string', default: 'gray.400' },
    ], defaultProps: { height: '20px', startColor: 'gray.100', endColor: 'gray.400' } },
    { id: 'Alert', name: 'Alert', description: 'Alert message', category: 'feedback', props: [
      { name: 'status', type: 'select', default: 'info', options: ['info', 'warning', 'success', 'error', 'loading'] },
      { name: 'variant', type: 'select', default: 'subtle', options: ['subtle', 'solid', 'left-accent', 'top-accent'] },
    ], defaultProps: { status: 'info', variant: 'subtle' } },
    { id: 'Modal', name: 'Modal', description: 'Modal dialog', category: 'overlays', props: [
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'] },
      { name: 'isCentered', type: 'boolean', default: false },
      { name: 'closeOnOverlayClick', type: 'boolean', default: true },
    ], defaultProps: { size: 'md', isCentered: false, closeOnOverlayClick: true } },
    { id: 'Drawer', name: 'Drawer', description: 'Side drawer', category: 'overlays', props: [
      { name: 'placement', type: 'select', default: 'right', options: ['top', 'right', 'bottom', 'left'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'] },
    ], defaultProps: { placement: 'right', size: 'md' } },
    { id: 'Popover', name: 'Popover', description: 'Popover content', category: 'overlays', props: [
      { name: 'placement', type: 'select', default: 'bottom', options: ['top', 'bottom', 'left', 'right', 'auto'] },
      { name: 'trigger', type: 'select', default: 'click', options: ['click', 'hover'] },
    ], defaultProps: { placement: 'bottom', trigger: 'click' } },
    { id: 'Tooltip', name: 'Tooltip', description: 'Hover tooltip', category: 'overlays', props: [
      { name: 'label', type: 'string', default: 'Tooltip' },
      { name: 'placement', type: 'select', default: 'top', options: ['top', 'bottom', 'left', 'right', 'auto'] },
      { name: 'hasArrow', type: 'boolean', default: true },
    ], defaultProps: { label: 'Tooltip', placement: 'top', hasArrow: true } },
    { id: 'Menu', name: 'Menu', description: 'Dropdown menu', category: 'overlays', props: [
      { name: 'closeOnSelect', type: 'boolean', default: true },
    ], defaultProps: { closeOnSelect: true } },
    { id: 'Heading', name: 'Heading', description: 'Heading text', category: 'typography', props: [
      { name: 'as', type: 'select', default: 'h2', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
      { name: 'size', type: 'select', default: 'xl', options: ['4xl', '3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'] },
    ], defaultProps: { as: 'h2', size: 'xl' } },
    { id: 'Text', name: 'Text', description: 'Body text', category: 'typography', props: [
      { name: 'fontSize', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] },
    ], defaultProps: { fontSize: 'md' } },
  ],
};

// =============================================================================
// MANTINE (React) - Full-featured Components
// =============================================================================
const mantine: LibraryMeta = {
  id: 'mantine',
  name: 'Mantine',
  framework: 'react',
  description: 'Full-featured React components library',
  website: 'https://mantine.dev',
  components: [
    { id: 'Button', name: 'Button', description: 'Button component', category: 'buttons', props: [
      { name: 'variant', type: 'select', default: 'filled', options: ['filled', 'light', 'outline', 'transparent', 'white', 'subtle', 'default', 'gradient'] },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange'] },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'loading', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'fullWidth', type: 'boolean', default: false },
    ], defaultProps: { variant: 'filled', color: 'blue', size: 'sm', radius: 'sm', loading: false, disabled: false, fullWidth: false } },
    { id: 'ActionIcon', name: 'Action Icon', description: 'Icon button', category: 'buttons', props: [
      { name: 'variant', type: 'select', default: 'subtle', options: ['filled', 'light', 'outline', 'transparent', 'subtle', 'default', 'gradient'] },
      { name: 'color', type: 'select', default: 'gray', options: ['gray', 'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { variant: 'subtle', color: 'gray', size: 'md', radius: 'sm' } },
    { id: 'TextInput', name: 'Text Input', description: 'Text input field', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Label' },
      { name: 'placeholder', type: 'string', default: 'Enter text' },
      { name: 'description', type: 'string', default: '' },
      { name: 'error', type: 'string', default: '' },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'withAsterisk', type: 'boolean', default: false },
    ], defaultProps: { label: 'Label', placeholder: 'Enter text', description: '', error: '', size: 'sm', radius: 'sm', disabled: false, withAsterisk: false } },
    { id: 'PasswordInput', name: 'Password Input', description: 'Password input', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Password' },
      { name: 'placeholder', type: 'string', default: 'Enter password' },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { label: 'Password', placeholder: 'Enter password', size: 'sm' } },
    { id: 'NumberInput', name: 'Number Input', description: 'Numeric input', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Number' },
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'step', type: 'number', default: 1 },
      { name: 'allowDecimal', type: 'boolean', default: true },
    ], defaultProps: { label: 'Number', min: 0, max: 100, step: 1, allowDecimal: true } },
    { id: 'Textarea', name: 'Textarea', description: 'Multi-line input', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Label' },
      { name: 'placeholder', type: 'string', default: 'Enter text' },
      { name: 'minRows', type: 'number', default: 2 },
      { name: 'maxRows', type: 'number', default: 4 },
      { name: 'autosize', type: 'boolean', default: false },
    ], defaultProps: { label: 'Label', placeholder: 'Enter text', minRows: 2, maxRows: 4, autosize: false } },
    { id: 'Select', name: 'Select', description: 'Dropdown select', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Select' },
      { name: 'placeholder', type: 'string', default: 'Pick one' },
      { name: 'searchable', type: 'boolean', default: false },
      { name: 'clearable', type: 'boolean', default: false },
      { name: 'nothingFoundMessage', type: 'string', default: 'Nothing found' },
    ], defaultProps: { label: 'Select', placeholder: 'Pick one', searchable: false, clearable: false, nothingFoundMessage: 'Nothing found' } },
    { id: 'MultiSelect', name: 'Multi Select', description: 'Multiple selection', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Multi Select' },
      { name: 'placeholder', type: 'string', default: 'Pick values' },
      { name: 'searchable', type: 'boolean', default: false },
      { name: 'clearable', type: 'boolean', default: false },
    ], defaultProps: { label: 'Multi Select', placeholder: 'Pick values', searchable: false, clearable: false } },
    { id: 'Checkbox', name: 'Checkbox', description: 'Checkbox input', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Checkbox' },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { label: 'Checkbox', color: 'blue', size: 'sm', radius: 'sm' } },
    { id: 'Radio', name: 'Radio', description: 'Radio button', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Radio' },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { label: 'Radio', color: 'blue', size: 'sm' } },
    { id: 'Switch', name: 'Switch', description: 'Toggle switch', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Switch' },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { label: 'Switch', color: 'blue', size: 'sm' } },
    { id: 'Slider', name: 'Slider', description: 'Range slider', category: 'inputs', props: [
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'step', type: 'number', default: 1 },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'marks', type: 'boolean', default: false },
    ], defaultProps: { min: 0, max: 100, step: 1, color: 'blue', marks: false } },
    { id: 'DatePicker', name: 'Date Picker', description: 'Date selection', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Date' },
      { name: 'placeholder', type: 'string', default: 'Pick date' },
      { name: 'clearable', type: 'boolean', default: false },
    ], defaultProps: { label: 'Date', placeholder: 'Pick date', clearable: false } },
    { id: 'ColorInput', name: 'Color Input', description: 'Color picker input', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Color' },
      { name: 'format', type: 'select', default: 'hex', options: ['hex', 'rgb', 'rgba', 'hsl', 'hsla'] },
    ], defaultProps: { label: 'Color', format: 'hex' } },
    { id: 'Rating', name: 'Rating', description: 'Star rating', category: 'inputs', props: [
      { name: 'count', type: 'number', default: 5 },
      { name: 'color', type: 'select', default: 'yellow', options: ['gray', 'red', 'green', 'blue', 'yellow', 'orange'] },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { count: 5, color: 'yellow', size: 'sm' } },
    { id: 'Card', name: 'Card', description: 'Card container', category: 'layout', props: [
      { name: 'shadow', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'padding', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'withBorder', type: 'boolean', default: true },
    ], defaultProps: { shadow: 'sm', padding: 'md', radius: 'md', withBorder: true } },
    { id: 'Paper', name: 'Paper', description: 'Paper surface', category: 'layout', props: [
      { name: 'shadow', type: 'select', default: 'xs', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'p', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'withBorder', type: 'boolean', default: false },
    ], defaultProps: { shadow: 'xs', p: 'md', radius: 'sm', withBorder: false } },
    { id: 'Accordion', name: 'Accordion', description: 'Accordion panels', category: 'layout', props: [
      { name: 'variant', type: 'select', default: 'default', options: ['default', 'contained', 'filled', 'separated'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { variant: 'default', radius: 'sm' } },
    { id: 'Tabs', name: 'Tabs', description: 'Tab navigation', category: 'navigation', props: [
      { name: 'variant', type: 'select', default: 'default', options: ['default', 'outline', 'pills'] },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'orientation', type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'] },
    ], defaultProps: { variant: 'default', color: 'blue', radius: 'sm', orientation: 'horizontal' } },
    { id: 'NavLink', name: 'Nav Link', description: 'Navigation link', category: 'navigation', props: [
      { name: 'label', type: 'string', default: 'Nav Link' },
      { name: 'active', type: 'boolean', default: false },
      { name: 'variant', type: 'select', default: 'light', options: ['light', 'filled', 'subtle'] },
    ], defaultProps: { label: 'Nav Link', active: false, variant: 'light' } },
    { id: 'Breadcrumbs', name: 'Breadcrumbs', description: 'Breadcrumb navigation', category: 'navigation', props: [
      { name: 'separator', type: 'string', default: '/' },
    ], defaultProps: { separator: '/' } },
    { id: 'Pagination', name: 'Pagination', description: 'Page navigation', category: 'navigation', props: [
      { name: 'total', type: 'number', default: 10 },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'withEdges', type: 'boolean', default: false },
    ], defaultProps: { total: 10, color: 'blue', radius: 'sm', size: 'md', withEdges: false } },
    { id: 'Stepper', name: 'Stepper', description: 'Step indicator', category: 'navigation', props: [
      { name: 'active', type: 'number', default: 1 },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'orientation', type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'] },
    ], defaultProps: { active: 1, color: 'blue', orientation: 'horizontal' } },
    { id: 'Table', name: 'Table', description: 'Data table', category: 'data', props: [
      { name: 'striped', type: 'boolean', default: false },
      { name: 'highlightOnHover', type: 'boolean', default: false },
      { name: 'withTableBorder', type: 'boolean', default: false },
      { name: 'withColumnBorders', type: 'boolean', default: false },
    ], defaultProps: { striped: false, highlightOnHover: false, withTableBorder: false, withColumnBorders: false } },
    { id: 'Badge', name: 'Badge', description: 'Badge/tag', category: 'data', props: [
      { name: 'variant', type: 'select', default: 'filled', options: ['filled', 'light', 'outline', 'dot', 'gradient'] },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'xl', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { variant: 'filled', color: 'blue', size: 'md', radius: 'xl' } },
    { id: 'Avatar', name: 'Avatar', description: 'User avatar', category: 'data', props: [
      { name: 'src', type: 'string', default: '' },
      { name: 'alt', type: 'string', default: 'Avatar' },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'xl', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
    ], defaultProps: { src: '', alt: 'Avatar', size: 'md', radius: 'xl', color: 'blue' } },
    { id: 'Indicator', name: 'Indicator', description: 'Status indicator', category: 'data', props: [
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'size', type: 'number', default: 10 },
      { name: 'processing', type: 'boolean', default: false },
    ], defaultProps: { color: 'blue', size: 10, processing: false } },
    { id: 'ThemeIcon', name: 'Theme Icon', description: 'Icon container', category: 'data', props: [
      { name: 'variant', type: 'select', default: 'filled', options: ['filled', 'light', 'outline', 'gradient'] },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { variant: 'filled', color: 'blue', size: 'md', radius: 'sm' } },
    { id: 'Progress', name: 'Progress', description: 'Progress bar', category: 'feedback', props: [
      { name: 'value', type: 'number', default: 50 },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'striped', type: 'boolean', default: false },
      { name: 'animated', type: 'boolean', default: false },
    ], defaultProps: { value: 50, color: 'blue', size: 'md', radius: 'sm', striped: false, animated: false } },
    { id: 'RingProgress', name: 'Ring Progress', description: 'Circular progress', category: 'feedback', props: [
      { name: 'size', type: 'number', default: 120 },
      { name: 'thickness', type: 'number', default: 12 },
    ], defaultProps: { size: 120, thickness: 12 } },
    { id: 'Loader', name: 'Loader', description: 'Loading indicator', category: 'feedback', props: [
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'type', type: 'select', default: 'oval', options: ['oval', 'bars', 'dots'] },
    ], defaultProps: { color: 'blue', size: 'md', type: 'oval' } },
    { id: 'Skeleton', name: 'Skeleton', description: 'Loading placeholder', category: 'feedback', props: [
      { name: 'height', type: 'number', default: 20 },
      { name: 'width', type: 'string', default: '100%' },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'animate', type: 'boolean', default: true },
    ], defaultProps: { height: 20, width: '100%', radius: 'sm', animate: true } },
    { id: 'Alert', name: 'Alert', description: 'Alert message', category: 'feedback', props: [
      { name: 'title', type: 'string', default: 'Alert' },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'variant', type: 'select', default: 'light', options: ['light', 'filled', 'outline'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'withCloseButton', type: 'boolean', default: false },
    ], defaultProps: { title: 'Alert', color: 'blue', variant: 'light', radius: 'sm', withCloseButton: false } },
    { id: 'Notification', name: 'Notification', description: 'Notification toast', category: 'feedback', props: [
      { name: 'title', type: 'string', default: 'Notification' },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'loading', type: 'boolean', default: false },
      { name: 'withCloseButton', type: 'boolean', default: true },
    ], defaultProps: { title: 'Notification', color: 'blue', loading: false, withCloseButton: true } },
    { id: 'Modal', name: 'Modal', description: 'Modal dialog', category: 'overlays', props: [
      { name: 'title', type: 'string', default: 'Modal' },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'centered', type: 'boolean', default: false },
      { name: 'withCloseButton', type: 'boolean', default: true },
    ], defaultProps: { title: 'Modal', size: 'md', centered: false, withCloseButton: true } },
    { id: 'Drawer', name: 'Drawer', description: 'Side drawer', category: 'overlays', props: [
      { name: 'title', type: 'string', default: 'Drawer' },
      { name: 'position', type: 'select', default: 'right', options: ['top', 'right', 'bottom', 'left'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { title: 'Drawer', position: 'right', size: 'md' } },
    { id: 'Popover', name: 'Popover', description: 'Popover content', category: 'overlays', props: [
      { name: 'position', type: 'select', default: 'bottom', options: ['top', 'bottom', 'left', 'right'] },
      { name: 'withArrow', type: 'boolean', default: true },
    ], defaultProps: { position: 'bottom', withArrow: true } },
    { id: 'Tooltip', name: 'Tooltip', description: 'Hover tooltip', category: 'overlays', props: [
      { name: 'label', type: 'string', default: 'Tooltip' },
      { name: 'position', type: 'select', default: 'top', options: ['top', 'bottom', 'left', 'right'] },
      { name: 'color', type: 'select', default: 'gray', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'withArrow', type: 'boolean', default: true },
    ], defaultProps: { label: 'Tooltip', position: 'top', color: 'gray', withArrow: true } },
    { id: 'HoverCard', name: 'Hover Card', description: 'Hover-triggered card', category: 'overlays', props: [
      { name: 'position', type: 'select', default: 'bottom', options: ['top', 'bottom', 'left', 'right'] },
      { name: 'withArrow', type: 'boolean', default: false },
    ], defaultProps: { position: 'bottom', withArrow: false } },
    { id: 'Menu', name: 'Menu', description: 'Dropdown menu', category: 'overlays', props: [
      { name: 'position', type: 'select', default: 'bottom', options: ['top', 'bottom', 'left', 'right'] },
      { name: 'withArrow', type: 'boolean', default: false },
    ], defaultProps: { position: 'bottom', withArrow: false } },
    { id: 'Title', name: 'Title', description: 'Heading text', category: 'typography', props: [
      { name: 'order', type: 'number', default: 1 },
      { name: 'size', type: 'select', default: 'h1', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
    ], defaultProps: { order: 1, size: 'h1' } },
    { id: 'Text', name: 'Text', description: 'Body text', category: 'typography', props: [
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'fw', type: 'number', default: 400 },
      { name: 'c', type: 'string', default: '' },
    ], defaultProps: { size: 'md', fw: 400, c: '' } },
    { id: 'Highlight', name: 'Highlight', description: 'Highlighted text', category: 'typography', props: [
      { name: 'highlight', type: 'string', default: 'text' },
      { name: 'highlightColor', type: 'select', default: 'yellow', options: ['gray', 'red', 'green', 'blue', 'yellow', 'orange'] },
    ], defaultProps: { highlight: 'text', highlightColor: 'yellow' } },
    { id: 'Code', name: 'Code', description: 'Inline code', category: 'typography', props: [
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
    ], defaultProps: { color: 'blue' } },
    
    // Additional Layout Components
    { id: 'Container', name: 'Container', description: 'Centered container', category: 'layout', props: [
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'fluid', type: 'boolean', default: false },
    ], defaultProps: { size: 'md', fluid: false } },
    { id: 'Grid', name: 'Grid', description: 'Grid layout', category: 'layout', props: [
      { name: 'columns', type: 'number', default: 12 },
      { name: 'gutter', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { columns: 12, gutter: 'md' } },
    { id: 'SimpleGrid', name: 'Simple Grid', description: 'Responsive grid', category: 'layout', props: [
      { name: 'cols', type: 'number', default: 3 },
      { name: 'spacing', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { cols: 3, spacing: 'md' } },
    { id: 'Flex', name: 'Flex', description: 'Flexbox container', category: 'layout', props: [
      { name: 'direction', type: 'select', default: 'row', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
      { name: 'align', type: 'select', default: 'stretch', options: ['stretch', 'center', 'flex-start', 'flex-end'] },
      { name: 'justify', type: 'select', default: 'flex-start', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'] },
      { name: 'gap', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { direction: 'row', align: 'stretch', justify: 'flex-start', gap: 'md' } },
    { id: 'Stack', name: 'Stack', description: 'Vertical stack', category: 'layout', props: [
      { name: 'gap', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'align', type: 'select', default: 'stretch', options: ['stretch', 'center', 'flex-start', 'flex-end'] },
    ], defaultProps: { gap: 'md', align: 'stretch' } },
    { id: 'Group', name: 'Group', description: 'Horizontal group', category: 'layout', props: [
      { name: 'gap', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'justify', type: 'select', default: 'flex-start', options: ['flex-start', 'center', 'flex-end', 'space-between'] },
    ], defaultProps: { gap: 'md', justify: 'flex-start' } },
    { id: 'Center', name: 'Center', description: 'Center content', category: 'layout', props: [
      { name: 'inline', type: 'boolean', default: false },
    ], defaultProps: { inline: false } },
    { id: 'AspectRatio', name: 'Aspect Ratio', description: 'Aspect ratio container', category: 'layout', props: [
      { name: 'ratio', type: 'number', default: 1.778 },
    ], defaultProps: { ratio: 1.778 } },
    { id: 'Space', name: 'Space', description: 'Spacer element', category: 'layout', props: [
      { name: 'h', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'w', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { h: 'md', w: 'md' } },
    { id: 'Divider', name: 'Divider', description: 'Horizontal divider', category: 'layout', props: [
      { name: 'variant', type: 'select', default: 'solid', options: ['solid', 'dashed', 'dotted'] },
      { name: 'color', type: 'select', default: 'gray', options: ['gray', 'red', 'green', 'blue', 'violet'] },
      { name: 'size', type: 'select', default: 'xs', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { variant: 'solid', color: 'gray', size: 'xs' } },
    
    // Additional Input Components
    { id: 'Autocomplete', name: 'Autocomplete', description: 'Autocomplete input', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Autocomplete' },
      { name: 'placeholder', type: 'string', default: 'Start typing...' },
    ], defaultProps: { label: 'Autocomplete', placeholder: 'Start typing...' } },
    { id: 'TagsInput', name: 'Tags Input', description: 'Tags input field', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Tags' },
      { name: 'placeholder', type: 'string', default: 'Enter tag' },
      { name: 'clearable', type: 'boolean', default: true },
    ], defaultProps: { label: 'Tags', placeholder: 'Enter tag', clearable: true } },
    { id: 'JsonInput', name: 'JSON Input', description: 'JSON editor', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'JSON' },
      { name: 'formatOnBlur', type: 'boolean', default: true },
      { name: 'validationError', type: 'string', default: 'Invalid JSON' },
    ], defaultProps: { label: 'JSON', formatOnBlur: true, validationError: 'Invalid JSON' } },
    { id: 'PinInput', name: 'PIN Input', description: 'PIN code input', category: 'inputs', props: [
      { name: 'length', type: 'number', default: 4 },
      { name: 'type', type: 'select', default: 'number', options: ['number', 'alphanumeric'] },
      { name: 'mask', type: 'boolean', default: false },
    ], defaultProps: { length: 4, type: 'number', mask: false } },
    { id: 'SegmentedControl', name: 'Segmented Control', description: 'Segmented button group', category: 'inputs', props: [
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet'] },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'fullWidth', type: 'boolean', default: false },
    ], defaultProps: { color: 'blue', size: 'sm', radius: 'sm', fullWidth: false } },
    { id: 'Chip', name: 'Chip', description: 'Chip component', category: 'inputs', props: [
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'variant', type: 'select', default: 'outline', options: ['outline', 'filled', 'light'] },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'checked', type: 'boolean', default: false },
    ], defaultProps: { color: 'blue', variant: 'outline', size: 'sm', checked: false } },
    { id: 'FileInput', name: 'File Input', description: 'File upload input', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Upload file' },
      { name: 'placeholder', type: 'string', default: 'Pick file' },
      { name: 'accept', type: 'string', default: '' },
      { name: 'multiple', type: 'boolean', default: false },
      { name: 'clearable', type: 'boolean', default: true },
    ], defaultProps: { label: 'Upload file', placeholder: 'Pick file', accept: '', multiple: false, clearable: true } },
    { id: 'NativeSelect', name: 'Native Select', description: 'Native HTML select', category: 'inputs', props: [
      { name: 'label', type: 'string', default: 'Select' },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { label: 'Select', size: 'sm' } },
    { id: 'ColorPicker', name: 'Color Picker', description: 'Color picker', category: 'inputs', props: [
      { name: 'format', type: 'select', default: 'hex', options: ['hex', 'rgb', 'rgba', 'hsl', 'hsla'] },
      { name: 'swatches', type: 'boolean', default: false },
    ], defaultProps: { format: 'hex', swatches: false } },
    { id: 'RangeSlider', name: 'Range Slider', description: 'Range slider', category: 'inputs', props: [
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet'] },
    ], defaultProps: { min: 0, max: 100, color: 'blue' } },
    
    // Navigation Components
    { id: 'Anchor', name: 'Anchor', description: 'Link/anchor element', category: 'navigation', props: [
      { name: 'href', type: 'string', default: '#' },
      { name: 'underline', type: 'select', default: 'always', options: ['always', 'hover', 'never'] },
    ], defaultProps: { href: '#', underline: 'always' } },
    { id: 'Burger', name: 'Burger', description: 'Burger menu icon', category: 'navigation', props: [
      { name: 'opened', type: 'boolean', default: false },
      { name: 'color', type: 'string', default: '' },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { opened: false, color: '', size: 'md' } },
    
    // Data Display Components
    { id: 'ThemeIcon', name: 'Theme Icon', description: 'Icon container with theme', category: 'data', props: [
      { name: 'variant', type: 'select', default: 'filled', options: ['filled', 'light', 'outline', 'gradient'] },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { variant: 'filled', color: 'blue', size: 'md', radius: 'sm' } },
    { id: 'ColorSwatch', name: 'Color Swatch', description: 'Color swatch', category: 'data', props: [
      { name: 'color', type: 'color', default: '#228be6' },
      { name: 'size', type: 'number', default: 25 },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { color: '#228be6', size: 25, radius: 'sm' } },
    { id: 'Timeline', name: 'Timeline', description: 'Timeline component', category: 'data', props: [
      { name: 'active', type: 'number', default: 1 },
      { name: 'bulletSize', type: 'number', default: 20 },
      { name: 'lineWidth', type: 'number', default: 2 },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet'] },
    ], defaultProps: { active: 1, bulletSize: 20, lineWidth: 2, color: 'blue' } },
    { id: 'Spoiler', name: 'Spoiler', description: 'Expandable content', category: 'data', props: [
      { name: 'maxHeight', type: 'number', default: 100 },
      { name: 'showLabel', type: 'string', default: 'Show more' },
      { name: 'hideLabel', type: 'string', default: 'Hide' },
    ], defaultProps: { maxHeight: 100, showLabel: 'Show more', hideLabel: 'Hide' } },
    { id: 'Kbd', name: 'Keyboard Key', description: 'Keyboard key display', category: 'data', props: [
      { name: 'children', type: 'string', default: 'Ctrl' },
      { name: 'size', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { children: 'Ctrl', size: 'sm' } },
    { id: 'Image', name: 'Image', description: 'Image component', category: 'data', props: [
      { name: 'src', type: 'string', default: '' },
      { name: 'alt', type: 'string', default: 'Image' },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'fit', type: 'select', default: 'cover', options: ['contain', 'cover', 'fill', 'none', 'scale-down'] },
    ], defaultProps: { src: '', alt: 'Image', radius: 'sm', fit: 'cover' } },
    { id: 'BackgroundImage', name: 'Background Image', description: 'Background image container', category: 'data', props: [
      { name: 'src', type: 'string', default: '' },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { src: '', radius: 'sm' } },
    
    // Feedback Components
    { id: 'Loader', name: 'Loader', description: 'Loading spinner', category: 'feedback', props: [
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'type', type: 'select', default: 'oval', options: ['oval', 'bars', 'dots'] },
    ], defaultProps: { color: 'blue', size: 'md', type: 'oval' } },
    { id: 'Notification', name: 'Notification', description: 'Notification message', category: 'feedback', props: [
      { name: 'title', type: 'string', default: 'Notification' },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet', 'orange'] },
      { name: 'loading', type: 'boolean', default: false },
      { name: 'withCloseButton', type: 'boolean', default: true },
    ], defaultProps: { title: 'Notification', color: 'blue', loading: false, withCloseButton: true } },
    { id: 'RingProgress', name: 'Ring Progress', description: 'Circular progress', category: 'feedback', props: [
      { name: 'value', type: 'number', default: 65 },
      { name: 'size', type: 'number', default: 120 },
      { name: 'thickness', type: 'number', default: 12 },
      { name: 'roundCaps', type: 'boolean', default: true },
    ], defaultProps: { value: 65, size: 120, thickness: 12, roundCaps: true } },
    
    // Overlay Components
    { id: 'Modal', name: 'Modal', description: 'Modal dialog', category: 'overlays', props: [
      { name: 'title', type: 'string', default: 'Modal title' },
      { name: 'centered', type: 'boolean', default: false },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'] },
      { name: 'radius', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { title: 'Modal title', centered: false, size: 'md', radius: 'sm' } },
    { id: 'Drawer', name: 'Drawer', description: 'Side drawer', category: 'overlays', props: [
      { name: 'title', type: 'string', default: 'Drawer' },
      { name: 'position', type: 'select', default: 'left', options: ['left', 'right', 'top', 'bottom'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'] },
    ], defaultProps: { title: 'Drawer', position: 'left', size: 'md' } },
    { id: 'Dialog', name: 'Dialog', description: 'Dialog box', category: 'overlays', props: [
      { name: 'withCloseButton', type: 'boolean', default: true },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { withCloseButton: true, size: 'md' } },
    { id: 'Tooltip', name: 'Tooltip', description: 'Tooltip popup', category: 'overlays', props: [
      { name: 'label', type: 'string', default: 'Tooltip' },
      { name: 'position', type: 'select', default: 'top', options: ['top', 'right', 'bottom', 'left'] },
      { name: 'color', type: 'select', default: 'gray', options: ['gray', 'red', 'green', 'blue', 'violet'] },
      { name: 'withArrow', type: 'boolean', default: true },
    ], defaultProps: { label: 'Tooltip', position: 'top', color: 'gray', withArrow: true } },
    { id: 'Popover', name: 'Popover', description: 'Popover container', category: 'overlays', props: [
      { name: 'position', type: 'select', default: 'bottom', options: ['top', 'right', 'bottom', 'left'] },
      { name: 'withArrow', type: 'boolean', default: true },
      { name: 'shadow', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { position: 'bottom', withArrow: true, shadow: 'md' } },
    { id: 'HoverCard', name: 'Hover Card', description: 'Hover activated card', category: 'overlays', props: [
      { name: 'position', type: 'select', default: 'bottom', options: ['top', 'right', 'bottom', 'left'] },
      { name: 'shadow', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'openDelay', type: 'number', default: 0 },
      { name: 'closeDelay', type: 'number', default: 150 },
    ], defaultProps: { position: 'bottom', shadow: 'md', openDelay: 0, closeDelay: 150 } },
    { id: 'Menu', name: 'Menu', description: 'Dropdown menu', category: 'overlays', props: [
      { name: 'trigger', type: 'select', default: 'click', options: ['click', 'hover'] },
      { name: 'position', type: 'select', default: 'bottom', options: ['top', 'right', 'bottom', 'left'] },
      { name: 'shadow', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'withArrow', type: 'boolean', default: false },
    ], defaultProps: { trigger: 'click', position: 'bottom', shadow: 'md', withArrow: false } },
    { id: 'LoadingOverlay', name: 'Loading Overlay', description: 'Overlay with loader', category: 'overlays', props: [
      { name: 'visible', type: 'boolean', default: true },
      { name: 'overlayBlur', type: 'number', default: 2 },
    ], defaultProps: { visible: true, overlayBlur: 2 } },
    { id: 'Affix', name: 'Affix', description: 'Fixed position element', category: 'overlays', props: [
      { name: 'position', type: 'select', default: 'bottom-right', options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] },
    ], defaultProps: { position: 'bottom-right' } },
    
    // Typography Components
    { id: 'Blockquote', name: 'Blockquote', description: 'Blockquote text', category: 'typography', props: [
      { name: 'cite', type: 'string', default: '' },
      { name: 'color', type: 'select', default: 'blue', options: ['gray', 'red', 'green', 'blue', 'violet'] },
    ], defaultProps: { cite: '', color: 'blue' } },
    { id: 'Mark', name: 'Mark', description: 'Marked/highlighted text', category: 'typography', props: [
      { name: 'color', type: 'select', default: 'yellow', options: ['gray', 'red', 'green', 'blue', 'yellow'] },
    ], defaultProps: { color: 'yellow' } },
    { id: 'List', name: 'List', description: 'List component', category: 'typography', props: [
      { name: 'type', type: 'select', default: 'unordered', options: ['ordered', 'unordered'] },
      { name: 'spacing', type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    ], defaultProps: { type: 'unordered', spacing: 'sm', size: 'md' } },
    
    // Miscellaneous Components
    { id: 'Box', name: 'Box', description: 'Polymorphic container', category: 'layout', props: [
      { name: 'component', type: 'string', default: 'div' },
    ], defaultProps: { component: 'div' } },
    { id: 'ScrollArea', name: 'Scroll Area', description: 'Scrollable container', category: 'layout', props: [
      { name: 'type', type: 'select', default: 'hover', options: ['auto', 'always', 'scroll', 'hover', 'never'] },
      { name: 'offsetScrollbars', type: 'boolean', default: false },
    ], defaultProps: { type: 'hover', offsetScrollbars: false } },
    { id: 'Collapse', name: 'Collapse', description: 'Collapsible content', category: 'layout', props: [
      { name: 'in', type: 'boolean', default: true },
      { name: 'transitionDuration', type: 'number', default: 200 },
    ], defaultProps: { in: true, transitionDuration: 200 } },
    { id: 'CloseButton', name: 'Close Button', description: 'Close/dismiss button', category: 'buttons', props: [
      { name: 'size', type: 'select', default: 'md', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { name: 'iconSize', type: 'number', default: 18 },
    ], defaultProps: { size: 'md', iconSize: 18 } },
    { id: 'CopyButton', name: 'Copy Button', description: 'Copy to clipboard button', category: 'buttons', props: [
      { name: 'value', type: 'string', default: '' },
      { name: 'timeout', type: 'number', default: 1000 },
    ], defaultProps: { value: '', timeout: 1000 } },
    { id: 'FileButton', name: 'File Button', description: 'File input as button', category: 'buttons', props: [
      { name: 'accept', type: 'string', default: '' },
      { name: 'multiple', type: 'boolean', default: false },
    ], defaultProps: { accept: '', multiple: false } },
    { id: 'UnstyledButton', name: 'Unstyled Button', description: 'Button without styles', category: 'buttons', props: [], defaultProps: {} },
  ],
};

// =============================================================================
// SHADCN/UI (React) - Re-usable Components
// =============================================================================
const shadcnui: LibraryMeta = {
  id: 'shadcnui',
  name: 'shadcn/ui',
  framework: 'react',
  description: 'Beautifully designed components built with Radix UI and Tailwind',
  website: 'https://ui.shadcn.com',
  components: [
    { id: 'Button', name: 'Button', description: 'Button component', category: 'buttons', props: [
      { name: 'variant', type: 'select', default: 'default', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
      { name: 'size', type: 'select', default: 'default', options: ['default', 'sm', 'lg', 'icon'] },
    ], defaultProps: { variant: 'default', size: 'default' } },
    { id: 'Input', name: 'Input', description: 'Text input', category: 'inputs', props: [
      { name: 'type', type: 'select', default: 'text', options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'] },
      { name: 'placeholder', type: 'string', default: 'Enter text' },
      { name: 'disabled', type: 'boolean', default: false },
    ], defaultProps: { type: 'text', placeholder: 'Enter text', disabled: false } },
    { id: 'Textarea', name: 'Textarea', description: 'Multi-line input', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Enter text' },
      { name: 'disabled', type: 'boolean', default: false },
    ], defaultProps: { placeholder: 'Enter text', disabled: false } },
    { id: 'Select', name: 'Select', description: 'Dropdown select', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Select an option' },
    ], defaultProps: { placeholder: 'Select an option' } },
    { id: 'Checkbox', name: 'Checkbox', description: 'Checkbox input', category: 'inputs', props: [
      { name: 'disabled', type: 'boolean', default: false },
    ], defaultProps: { disabled: false } },
    { id: 'RadioGroup', name: 'Radio Group', description: 'Radio button group', category: 'inputs', props: [], defaultProps: {} },
    { id: 'Switch', name: 'Switch', description: 'Toggle switch', category: 'inputs', props: [
      { name: 'disabled', type: 'boolean', default: false },
    ], defaultProps: { disabled: false } },
    { id: 'Slider', name: 'Slider', description: 'Range slider', category: 'inputs', props: [
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'step', type: 'number', default: 1 },
    ], defaultProps: { min: 0, max: 100, step: 1 } },
    { id: 'DatePicker', name: 'Date Picker', description: 'Date selection', category: 'inputs', props: [], defaultProps: {} },
    { id: 'Card', name: 'Card', description: 'Card container', category: 'layout', props: [], defaultProps: {} },
    { id: 'Accordion', name: 'Accordion', description: 'Accordion panels', category: 'layout', props: [
      { name: 'type', type: 'select', default: 'single', options: ['single', 'multiple'] },
      { name: 'collapsible', type: 'boolean', default: true },
    ], defaultProps: { type: 'single', collapsible: true } },
    { id: 'Collapsible', name: 'Collapsible', description: 'Collapsible content', category: 'layout', props: [], defaultProps: {} },
    { id: 'Separator', name: 'Separator', description: 'Visual divider', category: 'layout', props: [
      { name: 'orientation', type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'] },
    ], defaultProps: { orientation: 'horizontal' } },
    { id: 'Tabs', name: 'Tabs', description: 'Tab navigation', category: 'navigation', props: [], defaultProps: {} },
    { id: 'NavigationMenu', name: 'Navigation Menu', description: 'Navigation menu', category: 'navigation', props: [], defaultProps: {} },
    { id: 'Breadcrumb', name: 'Breadcrumb', description: 'Breadcrumb navigation', category: 'navigation', props: [], defaultProps: {} },
    { id: 'Pagination', name: 'Pagination', description: 'Page navigation', category: 'navigation', props: [], defaultProps: {} },
    { id: 'Table', name: 'Table', description: 'Data table', category: 'data', props: [], defaultProps: {} },
    { id: 'DataTable', name: 'Data Table', description: 'Advanced data table', category: 'data', props: [], defaultProps: {} },
    { id: 'Badge', name: 'Badge', description: 'Badge/tag', category: 'data', props: [
      { name: 'variant', type: 'select', default: 'default', options: ['default', 'secondary', 'destructive', 'outline'] },
    ], defaultProps: { variant: 'default' } },
    { id: 'Avatar', name: 'Avatar', description: 'User avatar', category: 'data', props: [], defaultProps: {} },
    { id: 'Calendar', name: 'Calendar', description: 'Calendar display', category: 'data', props: [], defaultProps: {} },
    { id: 'Progress', name: 'Progress', description: 'Progress bar', category: 'feedback', props: [
      { name: 'value', type: 'number', default: 50 },
    ], defaultProps: { value: 50 } },
    { id: 'Skeleton', name: 'Skeleton', description: 'Loading skeleton', category: 'feedback', props: [], defaultProps: {} },
    { id: 'Alert', name: 'Alert', description: 'Alert message', category: 'feedback', props: [
      { name: 'variant', type: 'select', default: 'default', options: ['default', 'destructive'] },
    ], defaultProps: { variant: 'default' } },
    { id: 'Toast', name: 'Toast', description: 'Toast notification', category: 'feedback', props: [], defaultProps: {} },
    { id: 'Dialog', name: 'Dialog', description: 'Modal dialog', category: 'overlays', props: [], defaultProps: {} },
    { id: 'AlertDialog', name: 'Alert Dialog', description: 'Confirmation dialog', category: 'overlays', props: [], defaultProps: {} },
    { id: 'Sheet', name: 'Sheet', description: 'Side sheet/drawer', category: 'overlays', props: [
      { name: 'side', type: 'select', default: 'right', options: ['top', 'right', 'bottom', 'left'] },
    ], defaultProps: { side: 'right' } },
    { id: 'Popover', name: 'Popover', description: 'Popover content', category: 'overlays', props: [], defaultProps: {} },
    { id: 'Tooltip', name: 'Tooltip', description: 'Hover tooltip', category: 'overlays', props: [], defaultProps: {} },
    { id: 'HoverCard', name: 'Hover Card', description: 'Hover-triggered card', category: 'overlays', props: [], defaultProps: {} },
    { id: 'ContextMenu', name: 'Context Menu', description: 'Right-click menu', category: 'overlays', props: [], defaultProps: {} },
    { id: 'DropdownMenu', name: 'Dropdown Menu', description: 'Dropdown menu', category: 'overlays', props: [], defaultProps: {} },
    { id: 'Command', name: 'Command', description: 'Command palette', category: 'overlays', props: [], defaultProps: {} },
  ],
};

// =============================================================================
// RADIX UI (React) - Unstyled Primitives
// =============================================================================
const radixui: LibraryMeta = {
  id: 'radixui',
  name: 'Radix UI',
  framework: 'react',
  description: 'Unstyled, accessible UI primitives for React',
  website: 'https://radix-ui.com',
  components: [
    { id: 'Accordion', name: 'Accordion', description: 'Vertically stacking panels', category: 'layout', props: [
      { name: 'type', type: 'select', default: 'single', options: ['single', 'multiple'] },
      { name: 'collapsible', type: 'boolean', default: false },
    ], defaultProps: { type: 'single', collapsible: false } },
    { id: 'AlertDialog', name: 'Alert Dialog', description: 'Modal interrupt dialog', category: 'overlays', props: [], defaultProps: {} },
    { id: 'AspectRatio', name: 'Aspect Ratio', description: 'Aspect ratio container', category: 'layout', props: [
      { name: 'ratio', type: 'number', default: 16/9 },
    ], defaultProps: { ratio: 16/9 } },
    { id: 'Avatar', name: 'Avatar', description: 'User avatar with fallback', category: 'data', props: [], defaultProps: {} },
    { id: 'Checkbox', name: 'Checkbox', description: 'Checkbox control', category: 'inputs', props: [], defaultProps: {} },
    { id: 'Collapsible', name: 'Collapsible', description: 'Collapsible sections', category: 'layout', props: [], defaultProps: {} },
    { id: 'ContextMenu', name: 'Context Menu', description: 'Right-click menu', category: 'overlays', props: [], defaultProps: {} },
    { id: 'Dialog', name: 'Dialog', description: 'Modal window', category: 'overlays', props: [
      { name: 'modal', type: 'boolean', default: true },
    ], defaultProps: { modal: true } },
    { id: 'DropdownMenu', name: 'Dropdown Menu', description: 'Dropdown menu', category: 'overlays', props: [], defaultProps: {} },
    { id: 'Form', name: 'Form', description: 'Form container', category: 'forms', props: [], defaultProps: {} },
    { id: 'HoverCard', name: 'Hover Card', description: 'Preview card on hover', category: 'overlays', props: [], defaultProps: {} },
    { id: 'Label', name: 'Label', description: 'Form label', category: 'forms', props: [], defaultProps: {} },
    { id: 'Menubar', name: 'Menubar', description: 'Horizontal menu bar', category: 'navigation', props: [], defaultProps: {} },
    { id: 'NavigationMenu', name: 'Navigation Menu', description: 'Site navigation', category: 'navigation', props: [], defaultProps: {} },
    { id: 'Popover', name: 'Popover', description: 'Popover container', category: 'overlays', props: [], defaultProps: {} },
    { id: 'Progress', name: 'Progress', description: 'Progress indicator', category: 'feedback', props: [
      { name: 'value', type: 'number', default: 50 },
      { name: 'max', type: 'number', default: 100 },
    ], defaultProps: { value: 50, max: 100 } },
    { id: 'RadioGroup', name: 'Radio Group', description: 'Radio button group', category: 'inputs', props: [], defaultProps: {} },
    { id: 'ScrollArea', name: 'Scroll Area', description: 'Custom scrollbar area', category: 'layout', props: [], defaultProps: {} },
    { id: 'Select', name: 'Select', description: 'Select dropdown', category: 'inputs', props: [], defaultProps: {} },
    { id: 'Separator', name: 'Separator', description: 'Visual separator', category: 'layout', props: [
      { name: 'orientation', type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'] },
    ], defaultProps: { orientation: 'horizontal' } },
    { id: 'Slider', name: 'Slider', description: 'Range input', category: 'inputs', props: [
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 100 },
      { name: 'step', type: 'number', default: 1 },
    ], defaultProps: { min: 0, max: 100, step: 1 } },
    { id: 'Switch', name: 'Switch', description: 'Toggle control', category: 'inputs', props: [], defaultProps: {} },
    { id: 'Tabs', name: 'Tabs', description: 'Tabbed interface', category: 'navigation', props: [], defaultProps: {} },
    { id: 'Toast', name: 'Toast', description: 'Toast notifications', category: 'feedback', props: [
      { name: 'duration', type: 'number', default: 5000 },
    ], defaultProps: { duration: 5000 } },
    { id: 'Toggle', name: 'Toggle', description: 'Toggle button', category: 'buttons', props: [], defaultProps: {} },
    { id: 'ToggleGroup', name: 'Toggle Group', description: 'Grouped toggles', category: 'buttons', props: [
      { name: 'type', type: 'select', default: 'single', options: ['single', 'multiple'] },
    ], defaultProps: { type: 'single' } },
    { id: 'Toolbar', name: 'Toolbar', description: 'Toolbar container', category: 'layout', props: [], defaultProps: {} },
    { id: 'Tooltip', name: 'Tooltip', description: 'Informational tooltip', category: 'overlays', props: [], defaultProps: {} },
  ],
};

// =============================================================================
// HEADLESS UI - Vue & React
// =============================================================================
const headlessVue: LibraryMeta = {
  id: 'headless-vue',
  name: 'Headless UI',
  framework: 'vue',
  description: 'Unstyled, accessible UI components for Vue',
  website: 'https://headlessui.com',
  components: [
    { id: 'Menu', name: 'Menu', description: 'Dropdown menu', category: 'overlays', props: [], defaultProps: {} },
    { id: 'Listbox', name: 'Listbox', description: 'Select listbox', category: 'inputs', props: [
      { name: 'multiple', type: 'boolean', default: false },
    ], defaultProps: { multiple: false } },
    { id: 'Combobox', name: 'Combobox', description: 'Autocomplete combobox', category: 'inputs', props: [
      { name: 'multiple', type: 'boolean', default: false },
    ], defaultProps: { multiple: false } },
    { id: 'Switch', name: 'Switch', description: 'Toggle switch', category: 'inputs', props: [], defaultProps: {} },
    { id: 'Disclosure', name: 'Disclosure', description: 'Collapsible disclosure', category: 'layout', props: [], defaultProps: {} },
    { id: 'Dialog', name: 'Dialog', description: 'Modal dialog', category: 'overlays', props: [], defaultProps: {} },
    { id: 'Popover', name: 'Popover', description: 'Popover container', category: 'overlays', props: [], defaultProps: {} },
    { id: 'RadioGroup', name: 'Radio Group', description: 'Radio button group', category: 'inputs', props: [], defaultProps: {} },
    { id: 'Tab', name: 'Tab', description: 'Tab interface', category: 'navigation', props: [], defaultProps: {} },
    { id: 'TransitionRoot', name: 'Transition', description: 'CSS transitions', category: 'layout', props: [
      { name: 'show', type: 'boolean', default: true },
    ], defaultProps: { show: true } },
  ],
};

const headlessReact: LibraryMeta = {
  id: 'headless-react',
  name: 'Headless UI',
  framework: 'react',
  description: 'Unstyled, accessible UI components for React',
  website: 'https://headlessui.com',
  components: headlessVue.components.map(c => ({ ...c })),
};

// =============================================================================
// CUSTOM COMPONENTS - Atlas Forge
// =============================================================================
const customVue: LibraryMeta = {
  id: 'custom-vue',
  name: 'Atlas Components',
  framework: 'vue',
  description: 'Custom Atlas Universalis component library',
  website: 'https://atlasuniversalis.com',
  components: [
    { id: 'Card', name: 'Card', description: 'Container card', category: 'layout', props: [
      { name: 'class', type: 'class', default: '' },
      { name: 'hover', type: 'boolean', default: false },
    ], defaultProps: { class: 'bg-night-900 border border-night-800 rounded-xl p-6', hover: true } },
    { id: 'Badge', name: 'Badge', description: 'Status badge', category: 'data', props: [
      { name: 'variant', type: 'select', default: 'default', options: ['default', 'success', 'warning', 'error'] },
      { name: 'text', type: 'string', default: 'Badge' },
    ], defaultProps: { variant: 'default', text: 'Badge' } },
    { id: 'Alert', name: 'Alert', description: 'Alert message', category: 'feedback', props: [
      { name: 'type', type: 'select', default: 'info', options: ['info', 'success', 'warning', 'error'] },
      { name: 'title', type: 'string', default: 'Alert' },
      { name: 'message', type: 'string', default: 'This is an alert.' },
    ], defaultProps: { type: 'info', title: 'Alert', message: 'This is an alert.' } },
    { id: 'Button', name: 'Button', description: 'Button', category: 'buttons', props: [
      { name: 'variant', type: 'select', default: 'primary', options: ['primary', 'secondary', 'ghost', 'danger'] },
      { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg'] },
      { name: 'text', type: 'string', default: 'Button' },
      { name: 'disabled', type: 'boolean', default: false },
    ], defaultProps: { variant: 'primary', size: 'md', text: 'Button', disabled: false } },
    { id: 'Input', name: 'Input', description: 'Text input', category: 'inputs', props: [
      { name: 'placeholder', type: 'string', default: 'Enter text...' },
      { name: 'label', type: 'string', default: 'Label' },
      { name: 'disabled', type: 'boolean', default: false },
    ], defaultProps: { placeholder: 'Enter text...', label: 'Label', disabled: false } },
    { id: 'Avatar', name: 'Avatar', description: 'User avatar', category: 'data', props: [
      { name: 'size', type: 'select', default: 'md', options: ['sm', 'md', 'lg', 'xl'] },
      { name: 'initials', type: 'string', default: 'AU' },
      { name: 'status', type: 'select', default: 'none', options: ['none', 'online', 'offline', 'busy'] },
    ], defaultProps: { size: 'md', initials: 'AU', status: 'online' } },
    { id: 'Progress', name: 'Progress', description: 'Progress bar', category: 'feedback', props: [
      { name: 'value', type: 'number', default: 60 },
      { name: 'color', type: 'select', default: 'atlas', options: ['atlas', 'gold', 'green', 'red'] },
      { name: 'showLabel', type: 'boolean', default: true },
    ], defaultProps: { value: 60, color: 'atlas', showLabel: true } },
    { id: 'Tabs', name: 'Tabs', description: 'Tab navigation', category: 'navigation', props: [
      { name: 'tabs', type: 'string', default: 'Tab 1,Tab 2,Tab 3' },
      { name: 'activeIndex', type: 'number', default: 0 },
    ], defaultProps: { tabs: 'Tab 1,Tab 2,Tab 3', activeIndex: 0 } },
  ],
};

const customReact: LibraryMeta = {
  id: 'custom-react',
  name: 'Atlas Components',
  framework: 'react',
  description: 'Custom Atlas Universalis component library',
  website: 'https://atlasuniversalis.com',
  components: customVue.components.map(c => ({
    ...c,
    props: c.props.map(p => p.name === 'class' ? { ...p, name: 'className' } : p),
    defaultProps: { ...c.defaultProps, className: c.defaultProps.class },
  })),
};

// =============================================================================
// EXPORTS
// =============================================================================
export const libraries: LibraryMeta[] = [
  // Vue Libraries
  heroiconsVue,
  vuetify,
  primevue,
  naiveui,
  headlessVue,
  customVue,
  // React Libraries
  heroiconsReact,
  chakraui,
  mantine,
  shadcnui,
  radixui,
  headlessReact,
  customReact,
];

export function getLibrary(id: string): LibraryMeta | undefined {
  return libraries.find(lib => lib.id === id);
}

export function getComponent(libraryId: string, componentId: string): ComponentMeta | undefined {
  const library = getLibrary(libraryId);
  return library?.components.find(c => c.id === componentId);
}

export function getLibrariesByFramework(framework: 'vue' | 'react'): LibraryMeta[] {
  return libraries.filter(lib => lib.framework === framework);
}

export function getCategories(): string[] {
  const categories = new Set<string>();
  libraries.forEach(lib => lib.components.forEach(c => categories.add(c.category)));
  return Array.from(categories);
}

// Stats
export function getStats() {
  const vueLibs = libraries.filter(l => l.framework === 'vue');
  const reactLibs = libraries.filter(l => l.framework === 'react');
  return {
    totalLibraries: libraries.length,
    vueLibraries: vueLibs.length,
    reactLibraries: reactLibs.length,
    totalComponents: libraries.reduce((sum, l) => sum + l.components.length, 0),
    vueComponents: vueLibs.reduce((sum, l) => sum + l.components.length, 0),
    reactComponents: reactLibs.reduce((sum, l) => sum + l.components.length, 0),
  };
}
