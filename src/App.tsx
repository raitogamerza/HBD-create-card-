import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateCard from './pages/CreateCard';
import ViewCard from './pages/ViewCard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateCard />} />
        <Route path="/card" element={<ViewCard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
