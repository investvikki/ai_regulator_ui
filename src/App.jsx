import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import EvaluationDashboardPage from "./pages/EvaluationDashboardPage";
import RunEvaluationPage from "./pages/RunEvaluationPage";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <main className="mt-12 h-full">
          <Routes>
            <Route path="/" element={<RunEvaluationPage />} />
            <Route path="/dashboard" element={<EvaluationDashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
