import { Route, Routes } from "react-router";
import { LayoutPage } from "./components/pages/layout.page";
import { MachinesPage } from "./components/pages/machines.page";
import { HomePage } from "./components/pages/home.page";
import { ErrorPage } from "./components/pages/error.page";
import { PipelinePage } from "./components/pipelines/pipeline.page";

function App() {
  return (
    <Routes>
      <Route element={<LayoutPage />}>
        <Route index element={<HomePage />} />
        <Route element={<MachinesPage />} path="/machines" />
        <Route element={<PipelinePage />} path="/pipelines" />
        <Route element={<ErrorPage />} path="*" />
      </Route>
    </Routes>
  );
}

export default App;
