import { Form } from "antd";
import * as React from "react";

const TransformControlPanel = ({ show, setShow, mode, setMode }) => {
    return (
        <div style={{paddingInline: 12 ,paddingBottom: 1, paddingTop: 1, background: '#f0f2f5', borderRadius: '8px'}}>
            <h4></h4>
            <Form>
                <Form.Item>
                    <div
                        onClick={() => setShow(false)}
                    >
                        <div
                            style={{
                                width: "20px",
                                height: "20px",
                                border: show === false ? "2px solid #1890ff" : "1px solid #d9d9d9",
                                borderRadius: "4px",
                                boxShadow: show === false ? "0 0 8px rgba(24, 144, 255, 0.5)" : "none",
                                transition: "all 0.3s ease",
                                overflow: "hidden",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "4px",
                            }}
                        >
                            <img
                                src={"./icons/cursor.png"}
                                alt="MostrarCursor"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain"
                                }}
                            />
                        </div>
                    </div>
                </Form.Item>
                <Form.Item>
                    <div
                        onClick={() => {
                            setMode('translate');
                            setShow(true)
                        }}
                    >
                        <div
                            style={{
                                width: "20px",
                                height: "20px",
                                border: mode === "translate" && show === true ? "2px solid #1890ff" : "1px solid #d9d9d9",
                                borderRadius: "4px",
                                boxShadow: mode === "translate"  && show === true ? "0 0 8px rgba(24, 144, 255, 0.5)" : "none",
                                transition: "all 0.3s ease",
                                overflow: "hidden",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "4px",
                            }}
                        >
                            <img
                                src={"./icons/move.png"}
                                alt="Mover"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain"
                                }}
                            />
                        </div>
                    </div>
                </Form.Item>
                <Form.Item>
                    <div
                        onClick={() => {
                            setMode('scale');
                            setShow(true)
                        }}
                    >
                        <div
                            style={{
                                width: "20px",
                                height: "20px",
                                border: mode === "scale" && show === true ? "2px solid #1890ff" : "1px solid #d9d9d9",
                                borderRadius: "4px",
                                boxShadow: mode === "scale" && show === true ? "0 0 8px rgba(24, 144, 255, 0.5)" : "none",
                                transition: "all 0.3s ease",
                                overflow: "hidden",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "4px",
                            }}
                        >
                            <img
                                src={"./icons/scale.png"}
                                alt="Escalar"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain"
                                }}
                            />
                        </div>
                    </div>
                </Form.Item>
                <Form.Item>
                    <div
                        onClick={() => {
                            setMode('rotate');
                            setShow(true);
                        }}
                    >
                        <div
                            style={{
                                width: "20px",
                                height: "20px",
                                border: mode === "rotate" && show === true ? "2px solid #1890ff" : "1px solid #d9d9d9",
                                borderRadius: "4px",
                                boxShadow: mode === "rotate" && show === true ? "0 0 8px rgba(24, 144, 255, 0.5)" : "none",
                                transition: "all 0.3s ease",
                                overflow: "hidden",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "4px",
                            }}
                        >
                            <img
                                src={"./icons/rotate.png"}
                                alt="Rotate"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain"
                                }}
                            />
                        </div>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default TransformControlPanel;