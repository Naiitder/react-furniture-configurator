import {RoomConfiguratorProvider} from "./RoomConfigurator.jsx";
import {SelectedItemProvider} from "./SelectedItemProvider.jsx";

export const AppProviders = ({...props}) => {
    return (
        <>
            <SelectedItemProvider>
                    <RoomConfiguratorProvider>
                            {props.children}
                    </RoomConfiguratorProvider>
            </SelectedItemProvider>
        </>
    )
}