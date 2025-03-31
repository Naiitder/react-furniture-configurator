import {Experience} from "./pages/Experience.jsx";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {FurnitureMenu} from "./pages/FurnitureMenu.jsx";

function App() {


    /*return (
        <>
            <Experience/>
            <ArmarioInterface/>
            <RoomConfigPanel/>

        </>
    )*/
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<FurnitureMenu/>}/>
                <Route path="canvas" element={<Experience/>}/>
                {/*<Route path="*" element={<NoPage/>}/>*/}
            </Routes>
        </BrowserRouter>
    );
}

export default App
