import HomePage from "./pages/HomePage";
import "./index.css";
function App() {
  console.log(import.meta.env);
  return (
    <div className="app">
      <div className="content">
        <HomePage />
      </div>
    </div>
  );
}

export default App;
