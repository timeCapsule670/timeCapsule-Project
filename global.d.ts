declare module '*.css';

// Allow importing SVGs and images if needed by web tooling
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';

// Allow NativeWind `className` prop on React Native elements
import "react";
declare module 'react' {
  interface Attributes {
    className?: string | undefined;
  }
}
