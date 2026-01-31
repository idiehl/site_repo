/**
 * MantineProviderWrapper - Wraps components with Mantine's required context
 */
import React, { useState, useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { getLoadedLibrary } from '../../lib/library-loader';

interface Props {
  componentId: string;
  componentProps: Record<string, any>;
}

// Dark theme for Mantine
const theme = createTheme({
  primaryColor: 'indigo',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
});

export default function MantineProviderWrapper({ componentId, componentProps }: Props) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const library = getLoadedLibrary('mantine');
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
  const needsChildren = ['Button', 'Badge', 'Text', 'Title', 'Anchor', 'NavLink'];
  const children = needsChildren.includes(componentId) 
    ? (componentProps.children || componentProps.label || componentProps.text || componentId)
    : undefined;
  
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Component {...componentProps}>
        {children}
      </Component>
    </MantineProvider>
  );
}
