import {RoomConfiguratorProvider} from "./RoomConfigurator.jsx";
import {CascoConfiguratorProvider} from "./useCascoConfigurator.jsx";

export const AppProviders = ({...props}) => {
    return (
        <>
            <CascoConfiguratorProvider>
                <RoomConfiguratorProvider>
                        {props.children}
                </RoomConfiguratorProvider>
            </CascoConfiguratorProvider>
        </>
    )
}