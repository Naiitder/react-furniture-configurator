import {FloatButton, Space, Typography} from "antd";
import {EyeInvisibleOutlined, EyeOutlined, MoreOutlined} from "@ant-design/icons";
import React, {useState} from "react";

const { Title } = Typography;

const ChildItemConfigurationInterface = ({
                                         title,
                                         children,
                                         width = "300px",
                                     }) => {

    const [visible, setVisible] = useState(true);

    const togglePanel = () => {
        setVisible(!visible);
    };


    return (
        <div>
            <FloatButton
                type="primary"
                shape="circle"
                size="large"
                icon={visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 100,
                }}
                onClick={togglePanel}/>
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
                    zIndex: 20,
                    transition: "all 0.3s ease",
                    opacity: visible ? 1 : 0,
                }}
            >

                <Space direction="vertical" size={16}>
                    <Title level={5} style={{ textAlign: "center" }}>{title}</Title>
                    {children}
                </Space>
            </div>
        </div>
    );
};

export default ChildItemConfigurationInterface;

