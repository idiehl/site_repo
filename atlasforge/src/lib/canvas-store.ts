/**
 * Canvas Store - State management for the playground canvas
 * Uses nanostores for cross-framework reactivity (works in both Vue and React)
 */

import { atom, map } from 'nanostores';

// Types
export interface CanvasElement {
  id: string;
  libraryId: string;
  componentId: string;
  framework: 'vue' | 'react';
  props: Record<string, any>;
  styles: {
    position: { x: number; y: number };
    size?: { width: number; height: number };  // Optional numeric size for resizable elements
    spacing: { margin: string; padding: string };
  };
  zIndex: number;
  locked: boolean;
  visible: boolean;
}

export interface CanvasState {
  elements: CanvasElement[];
  selectedId: string | null;
  layout: 'grid' | 'flex' | 'freeform';
  zoom: number;
  gridVisible: boolean;
}

export interface Design {
  id: string;
  name: string;
  elements: CanvasElement[];
  layout: 'grid' | 'flex' | 'freeform';
  createdAt: string;
  updatedAt: string;
}

// Stores
export const canvasElements = atom<CanvasElement[]>([]);
export const selectedElementId = atom<string | null>(null);
export const canvasLayout = atom<'grid' | 'flex' | 'freeform'>('freeform');
export const canvasZoom = atom<number>(100);
export const gridVisible = atom<boolean>(true);
export const currentDesign = atom<Design | null>(null);

// Preview state (for component browser preview)
export const previewComponent = map<{
  libraryId: string | null;
  componentId: string | null;
  props: Record<string, any>;
}>({
  libraryId: null,
  componentId: null,
  props: {},
});

// Actions
let elementIdCounter = 0;

export function generateElementId(): string {
  return `element-${Date.now()}-${++elementIdCounter}`;
}

export function addElement(
  libraryId: string,
  componentId: string,
  framework: 'vue' | 'react',
  props: Record<string, any>,
  position: { x: number; y: number } = { x: 100, y: 100 }
): CanvasElement {
  const element: CanvasElement = {
    id: generateElementId(),
    libraryId,
    componentId,
    framework,
    props,
    styles: {
      position,
      // No default size - let elements auto-size initially
      spacing: { margin: '0', padding: '0' },
    },
    zIndex: canvasElements.get().length,
    locked: false,
    visible: true,
  };
  
  canvasElements.set([...canvasElements.get(), element]);
  selectedElementId.set(element.id);
  
  return element;
}

export function removeElement(id: string): void {
  canvasElements.set(canvasElements.get().filter(el => el.id !== id));
  if (selectedElementId.get() === id) {
    selectedElementId.set(null);
  }
}

export function updateElement(id: string, updates: Partial<CanvasElement>): void {
  canvasElements.set(
    canvasElements.get().map(el => 
      el.id === id ? { ...el, ...updates } : el
    )
  );
}

export function updateElementProps(id: string, props: Record<string, any>): void {
  updateElement(id, { props });
}

export function updateElementPosition(id: string, position: { x: number; y: number }): void {
  const element = canvasElements.get().find(el => el.id === id);
  if (element) {
    updateElement(id, {
      styles: { ...element.styles, position },
    });
  }
}

export function updateElementSize(id: string, size: { width: number; height: number }): void {
  const element = canvasElements.get().find(el => el.id === id);
  if (element) {
    updateElement(id, {
      styles: { ...element.styles, size },
    });
  }
}

export function selectElement(id: string | null): void {
  selectedElementId.set(id);
}

export function getSelectedElement(): CanvasElement | undefined {
  const id = selectedElementId.get();
  return id ? canvasElements.get().find(el => el.id === id) : undefined;
}

export function moveElementUp(id: string): void {
  const elements = canvasElements.get();
  const element = elements.find(el => el.id === id);
  if (!element) return;
  
  const maxZ = Math.max(...elements.map(el => el.zIndex));
  if (element.zIndex < maxZ) {
    updateElement(id, { zIndex: element.zIndex + 1 });
  }
}

export function moveElementDown(id: string): void {
  const element = canvasElements.get().find(el => el.id === id);
  if (!element || element.zIndex <= 0) return;
  
  updateElement(id, { zIndex: element.zIndex - 1 });
}

export function duplicateElement(id: string): CanvasElement | undefined {
  const element = canvasElements.get().find(el => el.id === id);
  if (!element) return;
  
  return addElement(
    element.libraryId,
    element.componentId,
    element.framework,
    { ...element.props },
    { 
      x: element.styles.position.x + 20, 
      y: element.styles.position.y + 20 
    }
  );
}

export function clearCanvas(): void {
  canvasElements.set([]);
  selectedElementId.set(null);
}

// Preview actions
export function setPreviewComponent(libraryId: string, componentId: string, props: Record<string, any>): void {
  previewComponent.set({ libraryId, componentId, props });
}

export function updatePreviewProps(props: Record<string, any>): void {
  previewComponent.set({ ...previewComponent.get(), props });
}

export function clearPreview(): void {
  previewComponent.set({ libraryId: null, componentId: null, props: {} });
}

// Design persistence
export function saveDesign(name: string): Design {
  const design: Design = {
    id: `design-${Date.now()}`,
    name,
    elements: canvasElements.get(),
    layout: canvasLayout.get(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Save to localStorage
  const designs = getLocalDesigns();
  designs.push(design);
  localStorage.setItem('playground-designs', JSON.stringify(designs));
  
  currentDesign.set(design);
  return design;
}

export function loadDesign(design: Design): void {
  canvasElements.set(design.elements);
  canvasLayout.set(design.layout);
  currentDesign.set(design);
  selectedElementId.set(null);
}

export function getLocalDesigns(): Design[] {
  try {
    const data = localStorage.getItem('playground-designs');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteLocalDesign(id: string): void {
  const designs = getLocalDesigns().filter(d => d.id !== id);
  localStorage.setItem('playground-designs', JSON.stringify(designs));
}

// Export canvas state for code generation
export function exportCanvasState(): CanvasState {
  return {
    elements: canvasElements.get(),
    selectedId: selectedElementId.get(),
    layout: canvasLayout.get(),
    zoom: canvasZoom.get(),
    gridVisible: gridVisible.get(),
  };
}
