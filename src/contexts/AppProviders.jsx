import {RoomConfiguratorProvider} from "./RoomConfigurator.jsx";
import {SelectedItemProvider} from "./SelectedItemProvider.jsx";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {SelectedPieceProvider} from "./SelectedPieceProvider.jsx";
import {SelectedCajonProvider} from "./SelectedCajonProvider.jsx";

export const AppProviders = ({...props}) => {
    return (
        <>
            <SelectedItemProvider>
                <SelectedCajonProvider>
                <SelectedPieceProvider>
                <DndProvider backend={HTML5Backend}>
                    <RoomConfiguratorProvider>
                            {props.children}
                    </RoomConfiguratorProvider>
                </DndProvider>
                </SelectedPieceProvider>
                </SelectedCajonProvider>
            </SelectedItemProvider>
        </>
    )
}