import { AuthProvider } from "./app/providers/AuthProvider";
import { AppRoutes } from "./app/routes/AppRoutes";
import "./styles/globals.css";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
