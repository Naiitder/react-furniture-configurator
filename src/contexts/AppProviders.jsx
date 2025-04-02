import {RoomConfiguratorProvider} from "./RoomConfigurator.jsx";
import {ConfiguratorProvider} from "./Configurator.jsx";
import {ArmarioConfiguratorProvider} from "./ArmarioConfigurator.jsx";
import {CascoConfiguratorProvider} from "./useCascoConfigurator.jsx";

export const AppProviders = ({...props}) => {
    return (
        <>
            <CascoConfiguratorProvider>
            <ConfiguratorProvider>
                <RoomConfiguratorProvider>
                    <ArmarioConfiguratorProvider>
                        {props.children}
                    </ArmarioConfiguratorProvider>
                </RoomConfiguratorProvider>
            </ConfiguratorProvider>
            </CascoConfiguratorProvider>
        </>
    )
}