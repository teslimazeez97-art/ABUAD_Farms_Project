import React, { useEffect } from "react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 30,
        right: 30,
        background: "#2f855a",
        color: "white",
        padding: "12px 18px",
        borderRadius: 8,
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        fontWeight: 600,
        zIndex: 100,
        animation: "fadein 0.2s, fadeout 0.4s 2.1s",
      }}
    >
      {message}
    </div>
  );
}