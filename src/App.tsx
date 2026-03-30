import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CameraPage from './components/CameraPage';
import HistoryPage from './components/HistoryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CameraPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
