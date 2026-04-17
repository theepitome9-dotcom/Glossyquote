//DO NOT REMOVE THIS CODE
console.log("[index] Project ID is: ", process.env.EXPO_PUBLIC_VIBECODE_PROJECT_ID);
import "./global.css";
import "react-native-get-random-values";
import { LogBox } from "react-native";
LogBox.ignoreLogs([
  "Expo AV has been deprecated",
  "Disconnected from Metro",
  "Error fetching offerings",
  "OfferingsManager.Error",
  "None of the products registered in the RevenueCat dashboard",
]);

// Suppress RevenueCat SDK internal offerings error - it fires via native event emitter
// and cannot be caught in userland. Purchases still work correctly without offerings.
const _origConsoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('OfferingsManager.Error')) return;
  _origConsoleError(...args);
};

import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
