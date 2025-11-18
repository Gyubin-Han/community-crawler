import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import BoardPage from './pages/BoardPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <Routes>
          <Route path="/" element={<BoardPage />} />
          <Route path="/board/:boardId" element={<BoardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
