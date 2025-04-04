import {RoomConfiguratorProvider} from "./RoomConfigurator.jsx";
import {SelectedItemProvider} from "./SelectedItemProvider.jsx";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";

export const AppProviders = ({...props}) => {
    return (
        <>
            <SelectedItemProvider>
                <DndProvider backend={HTML5Backend}>
                    <RoomConfiguratorProvider>
                            {props.children}
                    </RoomConfiguratorProvider>
                </DndProvider>
            </SelectedItemProvider>
        </>
    )
}