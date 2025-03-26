import React, { useState, useRef, useEffect } from "react";
import { Layout, Menu, Row, Col, Card, Typography } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import {FurnitureMenuItem} from "../components/Menu/FurnitureMenuItem.jsx";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const furnitureCategories = [
    { key: "sofas", name: "Sofás" },
    { key: "chairs", name: "Sillas" },
    { key: "tables", name: "Mesas" },
    { key: "beds", name: "Camas" },
];

const furnitureItems = {
    sofas: ["Sofá de cuero", "Sofá esquinero", "Sofá cama"],
    chairs: ["Silla de oficina", "Silla de comedor", "Silla ergonómica"],
    tables: ["Mesa de centro", "Mesa de comedor", "Escritorio"],
    beds: ["Cama king size", "Cama individual", "Cama con almacenamiento"],
};

export const FurnitureMenu = () => {
    const [selectedCategory, setSelectedCategory] = useState("sofas");
    const categoryRefs = useRef({});

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 3; // Ajuste para mejorar la detección

            let lastCategory = furnitureCategories[furnitureCategories.length - 1].key;

            for (let category of furnitureCategories) {
                const element = categoryRefs.current[category.key];
                if (element) {
                    const offsetTop = element.offsetTop;
                    const height = element.offsetHeight;

                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
                        setSelectedCategory(category.key);
                        break;
                    }
                }
            }

            // Si se llega al final de la página, asegurar que la última categoría esté activa
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                setSelectedCategory(lastCategory);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToCategory = (categoryKey) => {
        categoryRefs.current[categoryKey]?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Barra superior */}
            <Header style={{
                background: "#001529",
                padding: "0 16px",
                color: "#fff",
                position: "fixed",
                width: "100%",
                zIndex: 1000
            }}>
                <Title level={3} style={{ color: "#fff", margin: 0 }}>
                    Menú de Muebles
                </Title>
            </Header>

            <Layout style={{ marginTop: 64 }}>
                {/* Menú lateral */}
                <Sider
                    width={200}
                    theme="dark"
                    style={{
                        overflow: 'auto',
                        height: 'calc(100vh - 64px)',
                        position: 'fixed',
                        left: 0
                    }}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedCategory]}
                        onClick={(e) => {
                            setSelectedCategory(e.key);
                            scrollToCategory(e.key);
                        }}
                        style={{ height: "100%", borderRight: 0 }}
                    >
                        {furnitureCategories.map((category) => (
                            <Menu.Item
                                key={category.key}
                                icon={<AppstoreOutlined />}
                            >
                                {category.name}
                            </Menu.Item>
                        ))}
                    </Menu>
                </Sider>

                {/* Contenido principal */}
                <Layout style={{
                    marginLeft: 200,
                    padding: "16px"
                }}>
                    <Content style={{ background: "#fff", padding: 24 }}>
                        {furnitureCategories.map((category) => (
                            <div
                                key={category.key}
                                id={category.key}
                                ref={(el) => categoryRefs.current[category.key] = el}
                                style={{ marginBottom: 240, paddingBottom: category.key === "beds" ? 360 : 0}}
                            >
                                <Title level={4}>{category.name}</Title>
                                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} justify="space-around">
                                    {furnitureItems[category.key].map((item, index) => (
                                        <Col key={index}>
                                            <FurnitureMenuItem name={item} />
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ))}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};