/**
 * Custom Vue Components Loader
 */
import type { LoadedLibrary } from '../library-loader';

// Import custom Vue components
import CustomCard from '../../components/vue/CustomCard.vue';
import CustomBadge from '../../components/vue/CustomBadge.vue';
import CustomAlert from '../../components/vue/CustomAlert.vue';
import CustomButton from '../../components/vue/CustomButton.vue';
import CustomInput from '../../components/vue/CustomInput.vue';
import CustomAvatar from '../../components/vue/CustomAvatar.vue';
import CustomProgress from '../../components/vue/CustomProgress.vue';
import CustomTabs from '../../components/vue/CustomTabs.vue';

const library: LoadedLibrary = {
  id: 'custom-vue',
  name: 'Atlas Components',
  framework: 'vue',
  components: {
    Card: CustomCard,
    Badge: CustomBadge,
    Alert: CustomAlert,
    Button: CustomButton,
    Input: CustomInput,
    Avatar: CustomAvatar,
    Progress: CustomProgress,
    Tabs: CustomTabs,
  },
  loaded: true,
};

export default library;
