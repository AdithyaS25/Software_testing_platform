import { Routes, Route } from "react-router-dom"
import { ExecuteTestCasePage } from "./features/execution/pages/ExecuteTestCasePage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Dashboard</div>} />
      <Route
        path="/test-cases/:id/execute"
        element={<ExecuteTestCasePage />}
      />
    </Routes>
  )
}

export default App
