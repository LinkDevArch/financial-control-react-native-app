import "expo-router/entry";
import { AlertProvider } from "./src/context/AlertContext";
import RootLayout from "./app/_layout";

export default function App() {
  return (
    <AlertProvider>
      <RootLayout/>
    </AlertProvider>
  );
}