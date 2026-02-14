import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_BASE_HEIGHT = Platform.OS === "ios" ? 88 : 68; // 64+24 or 56+12

export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  // Android 15+ can return 0; use minimum fallback
  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === "android" ? 24 : 0,
  );
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + bottomInset;
  const contentBottomPadding = tabBarHeight + 20; // extra buffer for scroll
  const scrollContentPadding = (base = 40) => base + bottomInset;
  return { tabBarHeight, contentBottomPadding, bottomInset, scrollContentPadding };
}
