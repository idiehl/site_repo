/**
 * Vuetify Library Loader
 * Full Vuetify component library with all components
 */
import * as Vuetify from 'vuetify/components';
import * as VuetifyDirectives from 'vuetify/directives';
import { createVuetify } from 'vuetify';
import type { LoadedLibrary } from '../library-loader';

// Import Vuetify styles
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

// Create Vuetify instance for provider
export const vuetifyInstance = createVuetify({
  components: Vuetify,
  directives: VuetifyDirectives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#5e6bf1',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
    },
  },
});

const library: LoadedLibrary = {
  id: 'vuetify',
  name: 'Vuetify',
  framework: 'vue',
  components: {
    // Buttons
    VBtn: Vuetify.VBtn,
    VBtnGroup: Vuetify.VBtnGroup,
    VBtnToggle: Vuetify.VBtnToggle,
    
    // Inputs
    VTextField: Vuetify.VTextField,
    VTextarea: Vuetify.VTextarea,
    VSelect: Vuetify.VSelect,
    VAutocomplete: Vuetify.VAutocomplete,
    VCombobox: Vuetify.VCombobox,
    VFileInput: Vuetify.VFileInput,
    VSlider: Vuetify.VSlider,
    VRangeSlider: Vuetify.VRangeSlider,
    VCheckbox: Vuetify.VCheckbox,
    VCheckboxBtn: Vuetify.VCheckboxBtn,
    VRadio: Vuetify.VRadio,
    VRadioGroup: Vuetify.VRadioGroup,
    VSwitch: Vuetify.VSwitch,
    VRating: Vuetify.VRating,
    VColorPicker: Vuetify.VColorPicker,
    VOtpInput: Vuetify.VOtpInput,
    
    // Layout
    VCard: Vuetify.VCard,
    VCardTitle: Vuetify.VCardTitle,
    VCardText: Vuetify.VCardText,
    VCardActions: Vuetify.VCardActions,
    VSheet: Vuetify.VSheet,
    VContainer: Vuetify.VContainer,
    VRow: Vuetify.VRow,
    VCol: Vuetify.VCol,
    VDivider: Vuetify.VDivider,
    VSpacer: Vuetify.VSpacer,
    VMain: Vuetify.VMain,
    VFooter: Vuetify.VFooter,
    
    // Navigation
    VAppBar: Vuetify.VAppBar,
    VAppBarNavIcon: Vuetify.VAppBarNavIcon,
    VAppBarTitle: Vuetify.VAppBarTitle,
    VToolbar: Vuetify.VToolbar,
    VToolbarTitle: Vuetify.VToolbarTitle,
    VToolbarItems: Vuetify.VToolbarItems,
    VTabs: Vuetify.VTabs,
    VTab: Vuetify.VTab,
    VTabsWindow: Vuetify.VTabsWindow,
    VTabsWindowItem: Vuetify.VTabsWindowItem,
    VNavigationDrawer: Vuetify.VNavigationDrawer,
    VMenu: Vuetify.VMenu,
    VBreadcrumbs: Vuetify.VBreadcrumbs,
    VBreadcrumbsItem: Vuetify.VBreadcrumbsItem,
    VPagination: Vuetify.VPagination,
    VBottomNavigation: Vuetify.VBottomNavigation,
    VBottomSheet: Vuetify.VBottomSheet,
    VStepper: Vuetify.VStepper,
    VStepperHeader: Vuetify.VStepperHeader,
    VStepperItem: Vuetify.VStepperItem,
    VStepperWindow: Vuetify.VStepperWindow,
    VStepperWindowItem: Vuetify.VStepperWindowItem,
    VStepperActions: Vuetify.VStepperActions,
    
    // Data Display
    VDataTable: Vuetify.VDataTable,
    VDataTableServer: Vuetify.VDataTableServer,
    VDataTableVirtual: Vuetify.VDataTableVirtual,
    VDataTableRow: Vuetify.VDataTableRow,
    VList: Vuetify.VList,
    VListItem: Vuetify.VListItem,
    VListItemTitle: Vuetify.VListItemTitle,
    VListItemSubtitle: Vuetify.VListItemSubtitle,
    VListSubheader: Vuetify.VListSubheader,
    VListGroup: Vuetify.VListGroup,
    VChip: Vuetify.VChip,
    VChipGroup: Vuetify.VChipGroup,
    VAvatar: Vuetify.VAvatar,
    VBadge: Vuetify.VBadge,
    VIcon: Vuetify.VIcon,
    VImg: Vuetify.VImg,
    VTable: Vuetify.VTable,
    VTimeline: Vuetify.VTimeline,
    VTimelineItem: Vuetify.VTimelineItem,
    VTreeview: Vuetify.VTreeview,
    VExpansionPanels: Vuetify.VExpansionPanels,
    VExpansionPanel: Vuetify.VExpansionPanel,
    VExpansionPanelTitle: Vuetify.VExpansionPanelTitle,
    VExpansionPanelText: Vuetify.VExpansionPanelText,
    VCarousel: Vuetify.VCarousel,
    VCarouselItem: Vuetify.VCarouselItem,
    
    // Feedback
    VAlert: Vuetify.VAlert,
    VAlertTitle: Vuetify.VAlertTitle,
    VSnackbar: Vuetify.VSnackbar,
    VProgressLinear: Vuetify.VProgressLinear,
    VProgressCircular: Vuetify.VProgressCircular,
    VDialog: Vuetify.VDialog,
    VOverlay: Vuetify.VOverlay,
    VTooltip: Vuetify.VTooltip,
    VSkeletonLoader: Vuetify.VSkeletonLoader,
    VBanner: Vuetify.VBanner,
    VBannerText: Vuetify.VBannerText,
    VBannerActions: Vuetify.VBannerActions,
    
    // Other
    VForm: Vuetify.VForm,
    VLabel: Vuetify.VLabel,
    VItemGroup: Vuetify.VItemGroup,
    VItem: Vuetify.VItem,
    VWindow: Vuetify.VWindow,
    VWindowItem: Vuetify.VWindowItem,
    VSlideGroup: Vuetify.VSlideGroup,
    VSlideGroupItem: Vuetify.VSlideGroupItem,
    VVirtualScroll: Vuetify.VVirtualScroll,
    VInfiniteScroll: Vuetify.VInfiniteScroll,
    VHover: Vuetify.VHover,
    VNoSsr: Vuetify.VNoSsr,
    VResponsive: Vuetify.VResponsive,
    VColorInput: Vuetify.VColorPicker,
    VLocaleProvider: Vuetify.VLocaleProvider,
    VDefaultsProvider: Vuetify.VDefaultsProvider,
  },
  Provider: vuetifyInstance,
  loaded: true,
};

export default library;
