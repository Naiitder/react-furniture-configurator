import {Button, Space, Typography} from "antd";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

const {Title} = Typography;

const BaseConfiguratorInterface = ({
                                       title,
                                       children,
                                       navigateTo = "/",
                                       width = "300px",
                                       position = "left"
                                   }) => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                ...(position === "left" ? {left: 0} : {right: 0}),
                padding: "20px",
                width: width,
                overflow: "auto",
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "8px",
                margin: "10px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
            }}
        >
            <Button onClick={() => navigate(navigateTo)}>
                <ArrowLeftOutlined/>
            </Button>
            <Space direction="vertical" size={16}>
                <Title level={5}>{title}</Title>
                {children}
            </Space>
        </div>
    );
};

export default BaseConfiguratorInterface;