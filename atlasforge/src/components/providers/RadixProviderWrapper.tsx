/**
 * RadixProviderWrapper - Wraps Radix primitives
 * Note: Radix primitives are unstyled, so we add basic styling
 */
import React, { useState, useEffect } from 'react';
import { getLoadedLibrary } from '../../lib/library-loader';

interface Props {
  componentId: string;
  componentProps: Record<string, any>;
}

export default function RadixProviderWrapper({ componentId, componentProps }: Props) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const library = getLoadedLibrary('radixui');
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
  
  // Add basic styling to Radix primitives
  const styledProps = {
    ...componentProps,
    className: `${componentProps.className || ''} radix-component`,
  };
  
  return (
    <div className="radix-provider">
      <Component {...styledProps} />
      <style>{`
        .radix-provider {
          --accent-color: #5e6bf1;
          --bg-color: #343446;
          --border-color: #444560;
          --text-color: #ececf2;
        }
        .radix-component {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
