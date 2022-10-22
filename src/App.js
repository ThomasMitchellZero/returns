import "./App.css";

import ProductContext from "./product-context";
import { useContext } from "react";
import { Route, Routes } from "react-router-dom";

import Main from "./components/UI/Main";
import ScanReceipts from "./Sections/Scan_Receipts/ScanReceipts";
import Placeholder from "./Sections/Placeholder/Placeholder";

// Returns
import Returns from "./Sections/Returns/Returns";
import ReturnsActions30 from "./Sections/Scan_Receipts/ReturnsActions30";
import ExchangeNav30 from "./Sections/Returns/Exchanges/ExchangeNav30";

function App() {
  const ctx = useContext(ProductContext);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Main />}>
          <Route index element={<Placeholder>Home</Placeholder>} />
          <Route path="home" element={<Placeholder>Home</Placeholder>} />
          <Route path="orders" element={<Placeholder>Orders</Placeholder>} />
          <Route
            path="showroom"
            element={<Placeholder>Showroom</Placeholder>}
          />

          <Route path="returns" element={<Returns />}>
            <Route index element={<ScanReceipts></ScanReceipts>}></Route>
            <Route path="scan_receipts" element={<ScanReceipts></ScanReceipts>}>
              <Route index element={<ReturnsActions30 />}></Route>
              <Route path="main" element={<ReturnsActions30 />}></Route>
              <Route path="exchange" element={<ExchangeNav30 />}></Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
