import { Card, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export const FurnitureMenuItem = ({ name, image }) => {
    const navigate = useNavigate();

    return (
        <Card
            hoverable
            style={{ 
                textAlign: 'center', 
                width: 250, 
                height: 300,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
            cover={
                <img 
                    alt={name}
                    src={image}
                    style={{
                        height: 200,
                        objectFit: 'cover'
                    }}
                />
            }
            onClick={() => navigate(`/canvas?item=${encodeURIComponent(name)}`)}
        >
            <Title level={5} style={{ margin: 0 }}>{name}</Title>
        </Card>
    );
};