/**
 * Mantine Library Loader
 * Full Mantine component library
 */
import * as Mantine from '@mantine/core';
import * as MantineHooks from '@mantine/hooks';
import * as MantineDates from '@mantine/dates';
import type { LoadedLibrary } from '../library-loader';

// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

const library: LoadedLibrary = {
  id: 'mantine',
  name: 'Mantine',
  framework: 'react',
  components: {
    // Layout
    AppShell: Mantine.AppShell,
    AspectRatio: Mantine.AspectRatio,
    Center: Mantine.Center,
    Container: Mantine.Container,
    Flex: Mantine.Flex,
    Grid: Mantine.Grid,
    Group: Mantine.Group,
    SimpleGrid: Mantine.SimpleGrid,
    Space: Mantine.Space,
    Stack: Mantine.Stack,
    
    // Buttons
    ActionIcon: Mantine.ActionIcon,
    ActionIconGroup: Mantine.ActionIconGroup,
    Button: Mantine.Button,
    ButtonGroup: Mantine.ButtonGroup,
    CloseButton: Mantine.CloseButton,
    CopyButton: Mantine.CopyButton,
    FileButton: Mantine.FileButton,
    UnstyledButton: Mantine.UnstyledButton,
    
    // Inputs
    Autocomplete: Mantine.Autocomplete,
    Checkbox: Mantine.Checkbox,
    CheckboxGroup: Mantine.Checkbox.Group,
    Chip: Mantine.Chip,
    ChipGroup: Mantine.Chip.Group,
    ColorInput: Mantine.ColorInput,
    ColorPicker: Mantine.ColorPicker,
    FileInput: Mantine.FileInput,
    Input: Mantine.Input,
    JsonInput: Mantine.JsonInput,
    MultiSelect: Mantine.MultiSelect,
    NativeSelect: Mantine.NativeSelect,
    NumberInput: Mantine.NumberInput,
    PasswordInput: Mantine.PasswordInput,
    PinInput: Mantine.PinInput,
    Radio: Mantine.Radio,
    RadioGroup: Mantine.Radio.Group,
    Rating: Mantine.Rating,
    SegmentedControl: Mantine.SegmentedControl,
    Select: Mantine.Select,
    Slider: Mantine.Slider,
    RangeSlider: Mantine.RangeSlider,
    Switch: Mantine.Switch,
    SwitchGroup: Mantine.Switch.Group,
    TagsInput: Mantine.TagsInput,
    Textarea: Mantine.Textarea,
    TextInput: Mantine.TextInput,
    
    // Navigation
    Anchor: Mantine.Anchor,
    Breadcrumbs: Mantine.Breadcrumbs,
    Burger: Mantine.Burger,
    NavLink: Mantine.NavLink,
    Pagination: Mantine.Pagination,
    Stepper: Mantine.Stepper,
    Tabs: Mantine.Tabs,
    
    // Data Display
    Accordion: Mantine.Accordion,
    Avatar: Mantine.Avatar,
    AvatarGroup: Mantine.Avatar.Group,
    BackgroundImage: Mantine.BackgroundImage,
    Badge: Mantine.Badge,
    Card: Mantine.Card,
    CardSection: Mantine.Card.Section,
    ColorSwatch: Mantine.ColorSwatch,
    Image: Mantine.Image,
    Indicator: Mantine.Indicator,
    Kbd: Mantine.Kbd,
    Spoiler: Mantine.Spoiler,
    Table: Mantine.Table,
    ThemeIcon: Mantine.ThemeIcon,
    Timeline: Mantine.Timeline,
    TimelineItem: Mantine.Timeline.Item,
    
    // Overlays
    Affix: Mantine.Affix,
    Dialog: Mantine.Dialog,
    Drawer: Mantine.Drawer,
    HoverCard: Mantine.HoverCard,
    LoadingOverlay: Mantine.LoadingOverlay,
    Menu: Mantine.Menu,
    Modal: Mantine.Modal,
    Overlay: Mantine.Overlay,
    Popover: Mantine.Popover,
    Tooltip: Mantine.Tooltip,
    
    // Typography
    Blockquote: Mantine.Blockquote,
    Code: Mantine.Code,
    Highlight: Mantine.Highlight,
    List: Mantine.List,
    ListItem: Mantine.List.Item,
    Mark: Mantine.Mark,
    Text: Mantine.Text,
    Title: Mantine.Title,
    TypographyStylesProvider: Mantine.TypographyStylesProvider,
    
    // Feedback
    Alert: Mantine.Alert,
    Loader: Mantine.Loader,
    Notification: Mantine.Notification,
    Progress: Mantine.Progress,
    ProgressRoot: Mantine.Progress.Root,
    ProgressSection: Mantine.Progress.Section,
    ProgressLabel: Mantine.Progress.Label,
    RingProgress: Mantine.RingProgress,
    Skeleton: Mantine.Skeleton,
    
    // Miscellaneous
    Box: Mantine.Box,
    Collapse: Mantine.Collapse,
    Divider: Mantine.Divider,
    FocusTrap: Mantine.FocusTrap,
    Paper: Mantine.Paper,
    Portal: Mantine.Portal,
    ScrollArea: Mantine.ScrollArea,
    Transition: Mantine.Transition,
    VisuallyHidden: Mantine.VisuallyHidden,
    
    // Dates
    Calendar: MantineDates.Calendar,
    DateInput: MantineDates.DateInput,
    DatePicker: MantineDates.DatePicker,
    DatePickerInput: MantineDates.DatePickerInput,
    DateTimePicker: MantineDates.DateTimePicker,
    MonthPicker: MantineDates.MonthPicker,
    MonthPickerInput: MantineDates.MonthPickerInput,
    TimeInput: MantineDates.TimeInput,
    YearPicker: MantineDates.YearPicker,
    YearPickerInput: MantineDates.YearPickerInput,
    
    // Combobox
    Combobox: Mantine.Combobox,
    
    // Provider
    MantineProvider: Mantine.MantineProvider,
  },
  Provider: Mantine.MantineProvider,
  loaded: true,
};

export default library;
