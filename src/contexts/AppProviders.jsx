import {RoomConfiguratorProvider} from "./RoomConfigurator.jsx";
import {ConfiguratorProvider} from "./Configurator.jsx";
import {ArmarioConfiguratorProvider} from "./ArmarioConfigurator.jsx";

export const AppProviders = ({...props}) => {
    return (
        <>
            <ConfiguratorProvider>
                <RoomConfiguratorProvider>
                    <ArmarioConfiguratorProvider>
                        {props.children}
                    </ArmarioConfiguratorProvider>
                </RoomConfiguratorProvider>
            </ConfiguratorProvider>
        </>
    )
}