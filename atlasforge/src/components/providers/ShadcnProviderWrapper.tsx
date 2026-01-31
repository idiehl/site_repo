/**
 * ShadcnProviderWrapper - Wraps shadcn/ui components
 */
import React, { useState, useEffect } from 'react';
import { getLoadedLibrary } from '../../lib/library-loader';

interface Props {
  componentId: string;
  componentProps: Record<string, any>;
}

export default function ShadcnProviderWrapper({ componentId, componentProps }: Props) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const library = getLoadedLibrary('shadcnui');
    if (library) {
      const Comp = library.components[componentId];
      setComponent(() => Comp || null);
    }
    setIsReady(true);
  }, [componentId]);
  
  if (!isReady) {
    return <div className="text-gray-500">Loading...</div>;
  }
  
  if (!Component) {
    return <div className="text-gray-500">Component not found: {componentId}</div>;
  }
  
  // Handle components that need children
  const needsChildren = ['Button', 'Badge', 'AlertTitle', 'AlertDescription', 'CardTitle', 'CardDescription'];
  const children = needsChildren.includes(componentId) 
    ? (componentProps.children || componentProps.label || componentProps.text || componentId)
    : undefined;
  
  return (
    <div className="shadcn-provider">
      <Component {...componentProps}>
        {children}
      </Component>
    </div>
  );
}
