import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Overview } from "./components/Overview";
import { Episodes } from "./components/Episodes";
import { Analytics } from "./components/Analytics";
import { Upload } from "./components/Upload";
import { Recording } from "./components/Recording";
import { Settings } from "./components/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Overview },
      { path: "episodes", Component: Episodes },
      { path: "analytics", Component: Analytics },
      { path: "upload", Component: Upload },
      { path: "recording", Component: Recording },
      { path: "settings", Component: Settings },
    ],
  },
]);
