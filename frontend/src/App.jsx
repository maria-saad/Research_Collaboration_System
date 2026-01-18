import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";

import ResearchersPage from "./pages/ResearchersPage";
import ProfilePage from "./pages/ProfilePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CreateResearcherPage from "./pages/CreateResearcherPage";
import RecentPublicationsPage from "./pages/RecentPublicationsPage";
import ProjectTeamPage from "./pages/ProjectTeamPage";
import ProjectsPage from "./pages/ProjectsPage";
import PublicationsPage from "./pages/PublicationsPage";


export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/researchers" replace />} />
        <Route path="/researchers" element={<ResearchersPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
<Route path="/publications" element={<PublicationsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/create" element={<CreateResearcherPage />} />
        <Route path="/publications/recent" element={<RecentPublicationsPage />} />
<Route path="/projects/team" element={<ProjectTeamPage />} />

        <Route path="*" element={<div style={{ padding: 12 }}>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}