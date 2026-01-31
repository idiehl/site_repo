/**
 * PrimeVue Library Loader
 * Full PrimeVue component library
 */
import type { LoadedLibrary } from '../library-loader';

// PrimeVue components - import individually for tree-shaking
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import InputMask from 'primevue/inputmask';
import Password from 'primevue/password';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Listbox from 'primevue/listbox';
import SelectButton from 'primevue/selectbutton';
import ToggleButton from 'primevue/togglebutton';
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import InputSwitch from 'primevue/inputswitch';
import Slider from 'primevue/slider';
import Rating from 'primevue/rating';
import ColorPicker from 'primevue/colorpicker';
import Knob from 'primevue/knob';
import Calendar from 'primevue/calendar';
import AutoComplete from 'primevue/autocomplete';
import CascadeSelect from 'primevue/cascadeselect';
import TreeSelect from 'primevue/treeselect';
import Chips from 'primevue/chips';
// Editor requires Quill - excluded to avoid heavy dependency

// Data
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import TreeTable from 'primevue/treetable';
import VirtualScroller from 'primevue/virtualscroller';
import Paginator from 'primevue/paginator';
import Tree from 'primevue/tree';
import Timeline from 'primevue/timeline';
import OrderList from 'primevue/orderlist';
import PickList from 'primevue/picklist';
import DataView from 'primevue/dataview';
import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
import OrganizationChart from 'primevue/organizationchart';

// Panel
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Fieldset from 'primevue/fieldset';
import Panel from 'primevue/panel';
import ScrollPanel from 'primevue/scrollpanel';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Toolbar from 'primevue/toolbar';
import ScrollTop from 'primevue/scrolltop';

// Overlay
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmPopup from 'primevue/confirmpopup';
import DynamicDialog from 'primevue/dynamicdialog';
import Sidebar from 'primevue/sidebar';
import OverlayPanel from 'primevue/overlaypanel';
import Tooltip from 'primevue/tooltip';

// File
import FileUpload from 'primevue/fileupload';

// Menu
import Menu from 'primevue/menu';
import Menubar from 'primevue/menubar';
import MegaMenu from 'primevue/megamenu';
import TieredMenu from 'primevue/tieredmenu';
import Breadcrumb from 'primevue/breadcrumb';
import ContextMenu from 'primevue/contextmenu';
import Steps from 'primevue/steps';
import TabMenu from 'primevue/tabmenu';
import Dock from 'primevue/dock';
import PanelMenu from 'primevue/panelmenu';
import SpeedDial from 'primevue/speeddial';

// Messages
import Message from 'primevue/message';
import InlineMessage from 'primevue/inlinemessage';
import Toast from 'primevue/toast';

// Media
import Image from 'primevue/image';
import Galleria from 'primevue/galleria';
import Carousel from 'primevue/carousel';

// Misc
import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import Badge from 'primevue/badge';
import BlockUI from 'primevue/blockui';
import Chip from 'primevue/chip';
import Inplace from 'primevue/inplace';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import Terminal from 'primevue/terminal';
import DeferredContent from 'primevue/deferredcontent';
import FocusTrap from 'primevue/focustrap';
import AnimateOnScroll from 'primevue/animateonscroll';

// Import PrimeVue styles
import 'primevue/resources/themes/lara-dark-blue/theme.css';
import 'primeicons/primeicons.css';

const library: LoadedLibrary = {
  id: 'primevue',
  name: 'PrimeVue',
  framework: 'vue',
  components: {
    // Form
    Button,
    InputText,
    InputNumber,
    InputMask,
    Password,
    Textarea,
    Dropdown,
    MultiSelect,
    Listbox,
    SelectButton,
    ToggleButton,
    Checkbox,
    RadioButton,
    InputSwitch,
    Slider,
    Rating,
    ColorPicker,
    Knob,
    Calendar,
    AutoComplete,
    CascadeSelect,
    TreeSelect,
    Chips,
    
    // Data
    DataTable,
    Column,
    ColumnGroup,
    Row,
    TreeTable,
    VirtualScroller,
    Paginator,
    Tree,
    Timeline,
    OrderList,
    PickList,
    DataView,
    DataViewLayoutOptions,
    OrganizationChart,
    
    // Panel
    Accordion,
    AccordionTab,
    Card,
    Divider,
    Fieldset,
    Panel,
    ScrollPanel,
    Splitter,
    SplitterPanel,
    TabView,
    TabPanel,
    Toolbar,
    ScrollTop,
    
    // Overlay
    Dialog,
    ConfirmDialog,
    ConfirmPopup,
    DynamicDialog,
    Sidebar,
    OverlayPanel,
    Tooltip,
    
    // File
    FileUpload,
    
    // Menu
    Menu,
    Menubar,
    MegaMenu,
    TieredMenu,
    Breadcrumb,
    ContextMenu,
    Steps,
    TabMenu,
    Dock,
    PanelMenu,
    SpeedDial,
    
    // Messages
    Message,
    InlineMessage,
    Toast,
    
    // Media
    Image,
    Galleria,
    Carousel,
    
    // Misc
    Avatar,
    AvatarGroup,
    Badge,
    BlockUI,
    Chip,
    Inplace,
    ProgressBar,
    ProgressSpinner,
    Skeleton,
    Tag,
    Terminal,
    DeferredContent,
    FocusTrap,
    AnimateOnScroll,
  },
  loaded: true,
};

export default library;
