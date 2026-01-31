/**
 * Code Generator - Export canvas designs as Vue/React/HTML code
 */

import type { CanvasElement } from './canvas-store';
import { getComponent, getLibrary } from './registry';

export type ExportFormat = 'vue' | 'react' | 'html';

interface ExportOptions {
  format: ExportFormat;
  includeStyles: boolean;
  minify: boolean;
}

// Generate props string for templates
function generatePropsString(props: Record<string, any>, format: ExportFormat): string {
  const entries = Object.entries(props).filter(([_, value]) => value !== undefined && value !== '');
  
  if (entries.length === 0) return '';
  
  return entries.map(([key, value]) => {
    if (typeof value === 'boolean') {
      return value ? key : '';
    }
    if (typeof value === 'string') {
      return `${key}="${value}"`;
    }
    if (format === 'react') {
      return `${key}={${JSON.stringify(value)}}`;
    }
    return `:${key}="${JSON.stringify(value)}"`;
  }).filter(Boolean).join(' ');
}

// Get component import path
function getImportPath(libraryId: string, componentId: string): string {
  if (libraryId.startsWith('heroicons-vue')) {
    return `@heroicons/vue/24/outline`;
  }
  if (libraryId.startsWith('heroicons-react')) {
    return `@heroicons/react/24/outline`;
  }
  if (libraryId.startsWith('headless-vue')) {
    return `@headlessui/vue`;
  }
  if (libraryId.startsWith('headless-react')) {
    return `@headlessui/react`;
  }
  return `@/components/${componentId}`;
}

// Generate Vue SFC
export function generateVueCode(elements: CanvasElement[], options: Partial<ExportOptions> = {}): string {
  const vueElements = elements.filter(el => el.framework === 'vue');
  
  if (vueElements.length === 0) {
    return '<!-- No Vue elements in design -->';
  }
  
  // Collect imports
  const imports: Map<string, Set<string>> = new Map();
  vueElements.forEach(el => {
    const importPath = getImportPath(el.libraryId, el.componentId);
    if (!imports.has(importPath)) {
      imports.set(importPath, new Set());
    }
    imports.get(importPath)!.add(el.componentId);
  });
  
  // Generate import statements
  const importStatements = Array.from(imports.entries())
    .map(([path, components]) => {
      const componentList = Array.from(components).join(', ');
      return `import { ${componentList} } from '${path}';`;
    })
    .join('\n');
  
  // Generate template
  const templateElements = vueElements.map(el => {
    const propsStr = generatePropsString(el.props, 'vue');
    const style = `position: absolute; left: ${el.styles.position.x}px; top: ${el.styles.position.y}px;`;
    
    // Self-closing for icons
    if (el.libraryId.includes('heroicons')) {
      return `    <${el.componentId} ${propsStr} style="${style}" />`;
    }
    
    return `    <${el.componentId} ${propsStr} style="${style}"></${el.componentId}>`;
  }).join('\n');
  
  return `<script setup>
${importStatements}
</script>

<template>
  <div class="relative w-full h-full">
${templateElements}
  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
`;
}

// Generate React JSX
export function generateReactCode(elements: CanvasElement[], options: Partial<ExportOptions> = {}): string {
  const reactElements = elements.filter(el => el.framework === 'react');
  
  if (reactElements.length === 0) {
    return '// No React elements in design';
  }
  
  // Collect imports
  const imports: Map<string, Set<string>> = new Map();
  reactElements.forEach(el => {
    const importPath = getImportPath(el.libraryId, el.componentId);
    if (!imports.has(importPath)) {
      imports.set(importPath, new Set());
    }
    imports.get(importPath)!.add(el.componentId);
  });
  
  // Generate import statements
  const importStatements = Array.from(imports.entries())
    .map(([path, components]) => {
      const componentList = Array.from(components).join(', ');
      return `import { ${componentList} } from '${path}';`;
    })
    .join('\n');
  
  // Generate JSX elements
  const jsxElements = reactElements.map(el => {
    const propsStr = generatePropsString(el.props, 'react');
    const style = `{{ position: 'absolute', left: ${el.styles.position.x}, top: ${el.styles.position.y} }}`;
    
    return `        <${el.componentId} ${propsStr} style={${style}} />`;
  }).join('\n');
  
  return `${importStatements}

export default function DesignComponent() {
  return (
    <div className="relative w-full h-full">
${jsxElements}
    </div>
  );
}
`;
}

// Generate plain HTML with Tailwind
export function generateHtmlCode(elements: CanvasElement[], options: Partial<ExportOptions> = {}): string {
  if (elements.length === 0) {
    return '<!-- No elements in design -->';
  }
  
  const htmlElements = elements.map(el => {
    const classAttr = el.props.class || el.props.className || '';
    const style = `position: absolute; left: ${el.styles.position.x}px; top: ${el.styles.position.y}px;`;
    
    // For icons, generate inline SVG placeholder
    if (el.libraryId.includes('heroicons')) {
      return `  <div class="${classAttr}" style="${style}" data-component="${el.componentId}">
    <!-- ${el.componentId} - Replace with actual SVG -->
    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </div>`;
    }
    
    return `  <div class="${classAttr}" style="${style}" data-component="${el.componentId}">
    <!-- ${el.componentId} content -->
  </div>`;
  }).join('\n\n');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Design</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-night-950">
  <div class="relative w-full min-h-screen">
${htmlElements}
  </div>
</body>
</html>
`;
}

// Main export function
export function generateCode(elements: CanvasElement[], format: ExportFormat, options: Partial<ExportOptions> = {}): string {
  switch (format) {
    case 'vue':
      return generateVueCode(elements, options);
    case 'react':
      return generateReactCode(elements, options);
    case 'html':
      return generateHtmlCode(elements, options);
    default:
      return '// Unknown format';
  }
}

// Copy to clipboard helper
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

// Download as file
export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
