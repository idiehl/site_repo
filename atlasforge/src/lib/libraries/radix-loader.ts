/**
 * Radix UI Library Loader
 * All Radix UI primitives
 */
import * as Accordion from '@radix-ui/react-accordion';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import * as Avatar from '@radix-ui/react-avatar';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as HoverCard from '@radix-ui/react-hover-card';
import * as Label from '@radix-ui/react-label';
import * as Menubar from '@radix-ui/react-menubar';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Popover from '@radix-ui/react-popover';
import * as Progress from '@radix-ui/react-progress';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Select from '@radix-ui/react-select';
import * as Separator from '@radix-ui/react-separator';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import * as Tabs from '@radix-ui/react-tabs';
import * as Toast from '@radix-ui/react-toast';
import * as Toggle from '@radix-ui/react-toggle';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { LoadedLibrary } from '../library-loader';

const library: LoadedLibrary = {
  id: 'radixui',
  name: 'Radix UI',
  framework: 'react',
  components: {
    // Accordion
    AccordionRoot: Accordion.Root,
    AccordionItem: Accordion.Item,
    AccordionTrigger: Accordion.Trigger,
    AccordionContent: Accordion.Content,
    AccordionHeader: Accordion.Header,
    
    // AlertDialog
    AlertDialogRoot: AlertDialog.Root,
    AlertDialogTrigger: AlertDialog.Trigger,
    AlertDialogPortal: AlertDialog.Portal,
    AlertDialogOverlay: AlertDialog.Overlay,
    AlertDialogContent: AlertDialog.Content,
    AlertDialogTitle: AlertDialog.Title,
    AlertDialogDescription: AlertDialog.Description,
    AlertDialogCancel: AlertDialog.Cancel,
    AlertDialogAction: AlertDialog.Action,
    
    // AspectRatio
    AspectRatioRoot: AspectRatio.Root,
    
    // Avatar
    AvatarRoot: Avatar.Root,
    AvatarImage: Avatar.Image,
    AvatarFallback: Avatar.Fallback,
    
    // Checkbox
    CheckboxRoot: Checkbox.Root,
    CheckboxIndicator: Checkbox.Indicator,
    
    // Collapsible
    CollapsibleRoot: Collapsible.Root,
    CollapsibleTrigger: Collapsible.Trigger,
    CollapsibleContent: Collapsible.Content,
    
    // ContextMenu
    ContextMenuRoot: ContextMenu.Root,
    ContextMenuTrigger: ContextMenu.Trigger,
    ContextMenuPortal: ContextMenu.Portal,
    ContextMenuContent: ContextMenu.Content,
    ContextMenuItem: ContextMenu.Item,
    ContextMenuGroup: ContextMenu.Group,
    ContextMenuLabel: ContextMenu.Label,
    ContextMenuCheckboxItem: ContextMenu.CheckboxItem,
    ContextMenuRadioGroup: ContextMenu.RadioGroup,
    ContextMenuRadioItem: ContextMenu.RadioItem,
    ContextMenuItemIndicator: ContextMenu.ItemIndicator,
    ContextMenuSeparator: ContextMenu.Separator,
    ContextMenuSub: ContextMenu.Sub,
    ContextMenuSubTrigger: ContextMenu.SubTrigger,
    ContextMenuSubContent: ContextMenu.SubContent,
    
    // Dialog
    DialogRoot: Dialog.Root,
    DialogTrigger: Dialog.Trigger,
    DialogPortal: Dialog.Portal,
    DialogOverlay: Dialog.Overlay,
    DialogContent: Dialog.Content,
    DialogTitle: Dialog.Title,
    DialogDescription: Dialog.Description,
    DialogClose: Dialog.Close,
    
    // DropdownMenu
    DropdownMenuRoot: DropdownMenu.Root,
    DropdownMenuTrigger: DropdownMenu.Trigger,
    DropdownMenuPortal: DropdownMenu.Portal,
    DropdownMenuContent: DropdownMenu.Content,
    DropdownMenuItem: DropdownMenu.Item,
    DropdownMenuGroup: DropdownMenu.Group,
    DropdownMenuLabel: DropdownMenu.Label,
    DropdownMenuCheckboxItem: DropdownMenu.CheckboxItem,
    DropdownMenuRadioGroup: DropdownMenu.RadioGroup,
    DropdownMenuRadioItem: DropdownMenu.RadioItem,
    DropdownMenuItemIndicator: DropdownMenu.ItemIndicator,
    DropdownMenuSeparator: DropdownMenu.Separator,
    DropdownMenuSub: DropdownMenu.Sub,
    DropdownMenuSubTrigger: DropdownMenu.SubTrigger,
    DropdownMenuSubContent: DropdownMenu.SubContent,
    DropdownMenuArrow: DropdownMenu.Arrow,
    
    // HoverCard
    HoverCardRoot: HoverCard.Root,
    HoverCardTrigger: HoverCard.Trigger,
    HoverCardPortal: HoverCard.Portal,
    HoverCardContent: HoverCard.Content,
    HoverCardArrow: HoverCard.Arrow,
    
    // Label
    LabelRoot: Label.Root,
    
    // Menubar
    MenubarRoot: Menubar.Root,
    MenubarTrigger: Menubar.Trigger,
    MenubarPortal: Menubar.Portal,
    MenubarContent: Menubar.Content,
    MenubarMenu: Menubar.Menu,
    MenubarItem: Menubar.Item,
    MenubarGroup: Menubar.Group,
    MenubarLabel: Menubar.Label,
    MenubarCheckboxItem: Menubar.CheckboxItem,
    MenubarRadioGroup: Menubar.RadioGroup,
    MenubarRadioItem: Menubar.RadioItem,
    MenubarItemIndicator: Menubar.ItemIndicator,
    MenubarSeparator: Menubar.Separator,
    MenubarSub: Menubar.Sub,
    MenubarSubTrigger: Menubar.SubTrigger,
    MenubarSubContent: Menubar.SubContent,
    MenubarArrow: Menubar.Arrow,
    
    // NavigationMenu
    NavigationMenuRoot: NavigationMenu.Root,
    NavigationMenuList: NavigationMenu.List,
    NavigationMenuItem: NavigationMenu.Item,
    NavigationMenuTrigger: NavigationMenu.Trigger,
    NavigationMenuContent: NavigationMenu.Content,
    NavigationMenuLink: NavigationMenu.Link,
    NavigationMenuIndicator: NavigationMenu.Indicator,
    NavigationMenuViewport: NavigationMenu.Viewport,
    
    // Popover
    PopoverRoot: Popover.Root,
    PopoverTrigger: Popover.Trigger,
    PopoverPortal: Popover.Portal,
    PopoverContent: Popover.Content,
    PopoverAnchor: Popover.Anchor,
    PopoverArrow: Popover.Arrow,
    PopoverClose: Popover.Close,
    
    // Progress
    ProgressRoot: Progress.Root,
    ProgressIndicator: Progress.Indicator,
    
    // RadioGroup
    RadioGroupRoot: RadioGroup.Root,
    RadioGroupItem: RadioGroup.Item,
    RadioGroupIndicator: RadioGroup.Indicator,
    
    // ScrollArea
    ScrollAreaRoot: ScrollArea.Root,
    ScrollAreaViewport: ScrollArea.Viewport,
    ScrollAreaScrollbar: ScrollArea.Scrollbar,
    ScrollAreaThumb: ScrollArea.Thumb,
    ScrollAreaCorner: ScrollArea.Corner,
    
    // Select
    SelectRoot: Select.Root,
    SelectTrigger: Select.Trigger,
    SelectValue: Select.Value,
    SelectIcon: Select.Icon,
    SelectPortal: Select.Portal,
    SelectContent: Select.Content,
    SelectViewport: Select.Viewport,
    SelectItem: Select.Item,
    SelectItemText: Select.ItemText,
    SelectItemIndicator: Select.ItemIndicator,
    SelectGroup: Select.Group,
    SelectLabel: Select.Label,
    SelectSeparator: Select.Separator,
    SelectScrollUpButton: Select.ScrollUpButton,
    SelectScrollDownButton: Select.ScrollDownButton,
    SelectArrow: Select.Arrow,
    
    // Separator
    SeparatorRoot: Separator.Root,
    
    // Slider
    SliderRoot: Slider.Root,
    SliderTrack: Slider.Track,
    SliderRange: Slider.Range,
    SliderThumb: Slider.Thumb,
    
    // Switch
    SwitchRoot: Switch.Root,
    SwitchThumb: Switch.Thumb,
    
    // Tabs
    TabsRoot: Tabs.Root,
    TabsList: Tabs.List,
    TabsTrigger: Tabs.Trigger,
    TabsContent: Tabs.Content,
    
    // Toast
    ToastProvider: Toast.Provider,
    ToastViewport: Toast.Viewport,
    ToastRoot: Toast.Root,
    ToastTitle: Toast.Title,
    ToastDescription: Toast.Description,
    ToastAction: Toast.Action,
    ToastClose: Toast.Close,
    
    // Toggle
    ToggleRoot: Toggle.Root,
    
    // ToggleGroup
    ToggleGroupRoot: ToggleGroup.Root,
    ToggleGroupItem: ToggleGroup.Item,
    
    // Toolbar
    ToolbarRoot: Toolbar.Root,
    ToolbarButton: Toolbar.Button,
    ToolbarSeparator: Toolbar.Separator,
    ToolbarLink: Toolbar.Link,
    ToolbarToggleGroup: Toolbar.ToggleGroup,
    ToolbarToggleItem: Toolbar.ToggleItem,
    
    // Tooltip
    TooltipProvider: Tooltip.Provider,
    TooltipRoot: Tooltip.Root,
    TooltipTrigger: Tooltip.Trigger,
    TooltipPortal: Tooltip.Portal,
    TooltipContent: Tooltip.Content,
    TooltipArrow: Tooltip.Arrow,
  },
  loaded: true,
};

export default library;
