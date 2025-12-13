import { Route, Routes } from "react-router";
import { LayoutPage } from "./components/pages/layout.page";
import { HomePage } from "./components/pages/home.page";

function App() {
  return (
    <Routes>
      <Route element={<LayoutPage />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
