import { Button, Space, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const TablaConfigurationInterface = ({
                                         title,
                                         children,
                                         width = "300px",
                                         show, setShow, mode, setMode
                                     }) => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                height: "350px",
                padding: "0px",
                width: width,
                overflow: "auto",
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "8px",
                margin: "10px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                zIndex: 20
            }}
        >
            <Space direction="vertical" size={16}>
                <Title level={5} style={{ textAlign: "center" }}>{title}</Title>
                {children}
            </Space>
        </div>
    );
};

export default TablaConfigurationInterface;

