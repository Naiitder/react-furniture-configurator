import React, {useEffect, useRef, useState} from "react";
import {Col, Layout, Menu, Row, Typography} from "antd";
import {AppstoreOutlined} from "@ant-design/icons";
import {FurnitureMenuItem} from "../components/Menu/FurnitureMenuItem.jsx";

const {Header, Sider, Content} = Layout;
const {Title} = Typography;

const furnitureCategories = [
    {key: "cascos", name: "Cascos"},
    {key: "aparadores", name: "Aparadores"},
    {key: "armarios", name: "Armarios"},
];

const furnitureItems = {
    cascos: [
        {name: "Casco", image: "/images/casco.jpg"},
    ],
    aparadores: [
        {name: "Aparador", image: "/images/aparador.jpg"},
    ],
    armarios: [
        {name: "Armario", image: "/images/armario.jpg"},
        {name: "Bodeguero", image: "/images/bodeguero.jpg"},
    ],
};

export const FurnitureMenu = () => {
    const [selectedCategory, setSelectedCategory] = useState("sofas");
    const categoryRefs = useRef({});
    const observer = useRef(null);

    useEffect(() => {
        // Opciones para el Intersection Observer
        const options = {
            root: null, // Viewport
            rootMargin: "0px",
            threshold: 0.3 // Porcentaje del elemento visible para activar
        };

        // Crear una nueva instancia de Intersection Observer
        observer.current = new IntersectionObserver((entries) => {
            // Encontrar la sección visible con mayor intersección
            const visibleEntry = entries.find(entry => entry.isIntersecting);

            if (visibleEntry) {
                const categoryKey = visibleEntry.target.getAttribute("data-category");
                setSelectedCategory(categoryKey);
            }
        }, options);

        // Observar cada categoría
        furnitureCategories.forEach((category) => {
            const element = categoryRefs.current[category.key];
            if (element) {
                observer.current.observe(element);
            }
        });

        // Limpiar al desmontar
        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, []);

    const scrollToCategory = (categoryKey) => {
        categoryRefs.current[categoryKey]?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    return (
        <Layout style={{minHeight: "100vh"}}>
            <Header style={{
                background: "#001529",
                padding: "0 16px",
                color: "#fff",
                position: "fixed",
                width: "100%",
                zIndex: 1000
            }}>
                <Title level={3} style={{color: "#fff", margin: 0}}>
                    Menú de Muebles
                </Title>
            </Header>

            <Layout style={{marginTop: 64}}>
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
                        style={{height: "100%", borderRight: 0}}
                    >
                        {furnitureCategories.map((category) => (
                            <Menu.Item
                                key={category.key}
                                icon={<AppstoreOutlined/>}
                            >
                                {category.name}
                            </Menu.Item>
                        ))}
                    </Menu>
                </Sider>

                <Layout style={{
                    marginLeft: 200,
                    padding: "16px"
                }}>
                    <Content style={{background: "#fff", padding: 24}}>
                        {furnitureCategories.map((category) => (
                            <div
                                key={category.key}
                                id={category.key}
                                data-category={category.key}
                                ref={(el) => categoryRefs.current[category.key] = el}
                                style={{
                                    marginBottom: 240,
                                    minHeight: "300px",
                                }}
                            >
                                <Title level={4} style={{borderBottom: "1px solid #001529",}}>
                                    {category.name}</Title>
                                <div className="furniture-items-container">
                                    <Row
                                        gutter={{xs: 8, sm: 16, md: 24, lg: 32}}
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            width: "100%",
                                        }}
                                    >
                                        {furnitureItems[category.key].map((item, index) => (
                                            <Col
                                                key={index}
                                                style={{
                                                    flex: "0 0 auto",
                                                    marginBottom: "20px"
                                                }}
                                            >
                                                <FurnitureMenuItem
                                                    name={item.name}
                                                    image={item.image}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </div>
                        ))}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};