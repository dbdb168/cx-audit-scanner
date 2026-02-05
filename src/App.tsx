import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { AuditResults } from "./components/AuditResults";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/audit/:companyId" element={<AuditResults />} />
        <Route path="/audit/:companyId/loading" element={<AuditResults />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
