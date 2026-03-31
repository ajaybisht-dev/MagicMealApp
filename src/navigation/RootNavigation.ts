// RootNavigation.ts
import { createNavigationContainerRef } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const openDrawer = () => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(DrawerActions.openDrawer());
  }
};
