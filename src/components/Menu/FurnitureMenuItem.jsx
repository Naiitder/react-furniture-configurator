import { Card, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export const FurnitureMenuItem = ({ name }) => {
    const navigate = useNavigate();

    return (
        <Card
            hoverable
            style={{ textAlign: 'center' }}
            onClick={() => navigate(`/canvas?item=${encodeURIComponent(name)}`)}
        >
            <Title level={5}>{name}</Title>
        </Card>
    );
};