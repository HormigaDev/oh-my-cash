import { defineBoot } from "#q-app";

import { useThemeStore } from "@/features/preferences/themeStore";

export default defineBoot(({ store }) => {
  useThemeStore(store).initialize();
});
