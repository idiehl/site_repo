/**
 * shadcn/ui Library Loader
 * Pre-styled Radix + Tailwind components
 * These are styled wrappers around Radix primitives
 */
import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LoadedLibrary } from '../library-loader';

// Utility function
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Button variants using CVA-style approach
const buttonVariants = {
  base: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  variants: {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  },
  sizes: {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
  },
};

// Styled Components
function Button({ className, variant = 'default', size = 'default', ...props }: any) {
  const variantClasses: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-500',
    outline: 'border border-gray-600 bg-transparent hover:bg-gray-800',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    ghost: 'hover:bg-gray-800',
    link: 'text-blue-400 underline-offset-4 hover:underline',
  };
  const sizeClasses: Record<string, string> = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-8',
    icon: 'h-9 w-9',
  };
  return React.createElement('button', {
    className: cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50',
      variantClasses[variant] || variantClasses.default,
      sizeClasses[size] || sizeClasses.default,
      className
    ),
    ...props,
  });
}

function Input({ className, type = 'text', ...props }: any) {
  return React.createElement('input', {
    type,
    className: cn(
      'flex h-9 w-full rounded-md border border-gray-600 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
      className
    ),
    ...props,
  });
}

function Textarea({ className, ...props }: any) {
  return React.createElement('textarea', {
    className: cn(
      'flex min-h-[60px] w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
      className
    ),
    ...props,
  });
}

function Card({ className, ...props }: any) {
  return React.createElement('div', {
    className: cn('rounded-xl border border-gray-700 bg-gray-900 text-white shadow', className),
    ...props,
  });
}

function CardHeader({ className, ...props }: any) {
  return React.createElement('div', {
    className: cn('flex flex-col space-y-1.5 p-6', className),
    ...props,
  });
}

function CardTitle({ className, ...props }: any) {
  return React.createElement('h3', {
    className: cn('font-semibold leading-none tracking-tight', className),
    ...props,
  });
}

function CardDescription({ className, ...props }: any) {
  return React.createElement('p', {
    className: cn('text-sm text-gray-400', className),
    ...props,
  });
}

function CardContent({ className, ...props }: any) {
  return React.createElement('div', {
    className: cn('p-6 pt-0', className),
    ...props,
  });
}

function CardFooter({ className, ...props }: any) {
  return React.createElement('div', {
    className: cn('flex items-center p-6 pt-0', className),
    ...props,
  });
}

function Badge({ className, variant = 'default', ...props }: any) {
  const variantClasses: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    destructive: 'bg-red-600 text-white hover:bg-red-500',
    outline: 'border border-gray-600 text-gray-300',
  };
  return React.createElement('div', {
    className: cn(
      'inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      variantClasses[variant] || variantClasses.default,
      className
    ),
    ...props,
  });
}

function Alert({ className, variant = 'default', ...props }: any) {
  const variantClasses: Record<string, string> = {
    default: 'bg-gray-800 text-gray-100 border-gray-700',
    destructive: 'border-red-500/50 text-red-400 bg-red-500/10',
  };
  return React.createElement('div', {
    role: 'alert',
    className: cn(
      'relative w-full rounded-lg border p-4',
      variantClasses[variant] || variantClasses.default,
      className
    ),
    ...props,
  });
}

function AlertTitle({ className, ...props }: any) {
  return React.createElement('h5', {
    className: cn('mb-1 font-medium leading-none tracking-tight', className),
    ...props,
  });
}

function AlertDescription({ className, ...props }: any) {
  return React.createElement('div', {
    className: cn('text-sm opacity-90', className),
    ...props,
  });
}

function Skeleton({ className, ...props }: any) {
  return React.createElement('div', {
    className: cn('animate-pulse rounded-md bg-gray-700', className),
    ...props,
  });
}

function Separator({ className, orientation = 'horizontal', decorative = true, ...props }: any) {
  return React.createElement(SeparatorPrimitive.Root, {
    decorative,
    orientation,
    className: cn(
      'shrink-0 bg-gray-700',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className
    ),
    ...props,
  });
}

function Progress({ className, value, ...props }: any) {
  return React.createElement(ProgressPrimitive.Root, {
    className: cn('relative h-2 w-full overflow-hidden rounded-full bg-gray-700', className),
    ...props,
  }, React.createElement(ProgressPrimitive.Indicator, {
    className: 'h-full w-full flex-1 bg-blue-600 transition-all',
    style: { transform: `translateX(-${100 - (value || 0)}%)` },
  }));
}

function Switch({ className, ...props }: any) {
  return React.createElement(SwitchPrimitive.Root, {
    className: cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-600',
      className
    ),
    ...props,
  }, React.createElement(SwitchPrimitive.Thumb, {
    className: cn(
      'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
    ),
  }));
}

function Checkbox({ className, ...props }: any) {
  return React.createElement(CheckboxPrimitive.Root, {
    className: cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-gray-600 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white',
      className
    ),
    ...props,
  }, React.createElement(CheckboxPrimitive.Indicator, {
    className: cn('flex items-center justify-center text-current'),
  }, React.createElement('svg', {
    className: 'h-4 w-4',
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 3,
  }, React.createElement('path', {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    d: 'M5 13l4 4L19 7',
  }))));
}

function Label({ className, ...props }: any) {
  return React.createElement(LabelPrimitive.Root, {
    className: cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    ),
    ...props,
  });
}

const library: LoadedLibrary = {
  id: 'shadcnui',
  name: 'shadcn/ui',
  framework: 'react',
  components: {
    // Core
    Button,
    Input,
    Textarea,
    
    // Card
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    
    // Feedback
    Badge,
    Alert,
    AlertTitle,
    AlertDescription,
    Skeleton,
    Progress,
    
    // Form
    Switch,
    Checkbox,
    Label,
    
    // Layout
    Separator,
    
    // Radix-based (unstyled, user needs to style)
    Accordion: AccordionPrimitive.Root,
    AccordionItem: AccordionPrimitive.Item,
    AccordionTrigger: AccordionPrimitive.Trigger,
    AccordionContent: AccordionPrimitive.Content,
    
    Dialog: DialogPrimitive.Root,
    DialogPortal: DialogPrimitive.Portal,
    DialogOverlay: DialogPrimitive.Overlay,
    DialogTrigger: DialogPrimitive.Trigger,
    DialogContent: DialogPrimitive.Content,
    DialogHeader: 'div',
    DialogFooter: 'div',
    DialogTitle: DialogPrimitive.Title,
    DialogDescription: DialogPrimitive.Description,
    DialogClose: DialogPrimitive.Close,
    
    DropdownMenu: DropdownMenuPrimitive.Root,
    DropdownMenuTrigger: DropdownMenuPrimitive.Trigger,
    DropdownMenuContent: DropdownMenuPrimitive.Content,
    DropdownMenuItem: DropdownMenuPrimitive.Item,
    DropdownMenuCheckboxItem: DropdownMenuPrimitive.CheckboxItem,
    DropdownMenuRadioItem: DropdownMenuPrimitive.RadioItem,
    DropdownMenuLabel: DropdownMenuPrimitive.Label,
    DropdownMenuSeparator: DropdownMenuPrimitive.Separator,
    DropdownMenuShortcut: 'span',
    DropdownMenuGroup: DropdownMenuPrimitive.Group,
    DropdownMenuPortal: DropdownMenuPrimitive.Portal,
    DropdownMenuSub: DropdownMenuPrimitive.Sub,
    DropdownMenuSubContent: DropdownMenuPrimitive.SubContent,
    DropdownMenuSubTrigger: DropdownMenuPrimitive.SubTrigger,
    DropdownMenuRadioGroup: DropdownMenuPrimitive.RadioGroup,
    
    Popover: PopoverPrimitive.Root,
    PopoverTrigger: PopoverPrimitive.Trigger,
    PopoverContent: PopoverPrimitive.Content,
    PopoverAnchor: PopoverPrimitive.Anchor,
    
    Select: SelectPrimitive.Root,
    SelectGroup: SelectPrimitive.Group,
    SelectValue: SelectPrimitive.Value,
    SelectTrigger: SelectPrimitive.Trigger,
    SelectContent: SelectPrimitive.Content,
    SelectLabel: SelectPrimitive.Label,
    SelectItem: SelectPrimitive.Item,
    SelectSeparator: SelectPrimitive.Separator,
    SelectScrollUpButton: SelectPrimitive.ScrollUpButton,
    SelectScrollDownButton: SelectPrimitive.ScrollDownButton,
    
    Slider: SliderPrimitive.Root,
    
    Tabs: TabsPrimitive.Root,
    TabsList: TabsPrimitive.List,
    TabsTrigger: TabsPrimitive.Trigger,
    TabsContent: TabsPrimitive.Content,
    
    Tooltip: TooltipPrimitive.Root,
    TooltipTrigger: TooltipPrimitive.Trigger,
    TooltipContent: TooltipPrimitive.Content,
    TooltipProvider: TooltipPrimitive.Provider,
    
    Avatar: AvatarPrimitive.Root,
    AvatarImage: AvatarPrimitive.Image,
    AvatarFallback: AvatarPrimitive.Fallback,
    
    RadioGroup: RadioGroupPrimitive.Root,
    RadioGroupItem: RadioGroupPrimitive.Item,
    
    AlertDialog: AlertDialogPrimitive.Root,
    AlertDialogTrigger: AlertDialogPrimitive.Trigger,
    AlertDialogContent: AlertDialogPrimitive.Content,
    AlertDialogHeader: 'div',
    AlertDialogFooter: 'div',
    AlertDialogTitle: AlertDialogPrimitive.Title,
    AlertDialogDescription: AlertDialogPrimitive.Description,
    AlertDialogAction: AlertDialogPrimitive.Action,
    AlertDialogCancel: AlertDialogPrimitive.Cancel,
  },
  loaded: true,
};

export default library;
