import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import DashboardPage from "@/pages/DashboardPage/DashboardPage";
import RequirementInputPage from "@/pages/RequirementInputPage/RequirementInputPage";
import FieldConfirmPage from "@/pages/FieldConfirmPage/FieldConfirmPage";
import FilePreviewPage from "@/pages/FilePreviewPage/FilePreviewPage";
import RiskDetectionPage from "@/pages/RiskDetectionPage/RiskDetectionPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="create" element={<RequirementInputPage />} />
        <Route path="create/fields" element={<FieldConfirmPage />} />
        <Route path="create/preview" element={<FilePreviewPage />} />
        <Route path="create/risk" element={<RiskDetectionPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
