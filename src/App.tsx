import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { BoostPage } from "./pages/BoostPage";
import { CleanerPage } from "./pages/CleanerPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GamesPage } from "./pages/GamesPage";
import { NetworkPage } from "./pages/NetworkPage";
import { RestorePage } from "./pages/RestorePage";
import { ScannerPage } from "./pages/ScannerPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TweaksPage } from "./pages/TweaksPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="scanner" element={<ScannerPage />} />
        <Route path="tweaks" element={<TweaksPage />} />
        <Route path="boost" element={<BoostPage />} />
        <Route path="optimize" element={<Navigate to="/boost" replace />} />
        <Route path="cleaner" element={<CleanerPage />} />
        <Route path="restore" element={<RestorePage />} />
        <Route path="games" element={<GamesPage />} />
        <Route path="network" element={<NetworkPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
