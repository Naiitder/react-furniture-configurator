import React from 'react';

const ItemSelector = ({ options, currentValue, onValueChange }) => {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
            {options.map(option => (
                <div
                    key={option.value}
                    onClick={() => {
                        onValueChange(option.value);
                    }}
                    style={{
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    <div
                        style={{
                            width: "60px",
                            height: "60px",
                            border: option.value === currentValue ? "2px solid #1890ff" : "1px solid #d9d9d9",
                            borderRadius: "4px",
                            boxShadow: option.value === currentValue ? "0 0 8px rgba(24, 144, 255, 0.5)" : "none",
                            transition: "all 0.3s ease",
                            overflow: "hidden",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "4px",
                            backgroundColor: option.image === undefined ? option.value : "none",
                        }}
                    >
                        {option.image !== undefined && <img
                            src={option.image}
                            alt={option.label}
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain"
                            }}
                        />}
                    </div>
                    <span>{option.label}</span>
                </div>
            ))}
        </div>
    );
};

export default ItemSelector;