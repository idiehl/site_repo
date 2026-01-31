/**
 * ChakraProviderWrapper - Wraps components with Chakra UI's required context
 */
import React, { useState, useEffect } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { getLoadedLibrary } from '../../lib/library-loader';

interface Props {
  componentId: string;
  componentProps: Record<string, any>;
}

// Dark theme for Chakra
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e8e9ff',
      100: '#c4c7ff',
      200: '#9da2ff',
      300: '#767dff',
      400: '#5e6bf1',
      500: '#4a4de5',
      600: '#3c3fc7',
      700: '#2e31a9',
      800: '#20238b',
      900: '#12156d',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'transparent',
      },
    },
  },
});

export default function ChakraProviderWrapper({ componentId, componentProps }: Props) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const library = getLoadedLibrary('chakraui');
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
  const needsChildren = ['Button', 'Badge', 'Tag', 'Text', 'Heading', 'Link', 'Tab', 'MenuItem'];
  const children = needsChildren.includes(componentId) 
    ? (componentProps.children || componentProps.label || componentProps.text || componentId)
    : undefined;
  
  return (
    <ChakraProvider theme={theme}>
      <Component {...componentProps}>
        {children}
      </Component>
    </ChakraProvider>
  );
}
