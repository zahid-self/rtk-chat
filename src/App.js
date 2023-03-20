import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PriateRoute from "./components/PriateRoute";
import PublicRoute from "./components/PrublicRoute";
import { useCheckAuth } from "./hooks/useCheckAuth";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {

    const authChecked = useCheckAuth();

    if (!authChecked) {
        return <div>Checking Authorization</div>
    } else {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/inbox" element={<PriateRoute><Conversation /></PriateRoute>} />
                    <Route path="/inbox/:id" element={<PriateRoute><Inbox /></PriateRoute>} />
                </Routes>
            </Router>
        );
    }

   
}

export default App;
