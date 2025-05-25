import React from "react";

const animeTabs = Array.from({ length: 100 }, (_, i) => `アニメタブ${i + 1}`);
const maleTabs = Array.from({ length: 100 }, (_, i) => `男性タブ${i + 1}`);

export default function AnimeMaleTabs() {
  const [activeTab, setActiveTab] = React.useState<string>(animeTabs[0]);
  return (
    <div>
      <h2>アニメタブ</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {animeTabs.map((tab) => (
          <button
            key={tab}
            style={{
              padding: "4px 8px",
              background: activeTab === tab ? "#0070f3" : "#eee",
              color: activeTab === tab ? "#fff" : "#333",
              border: "none",
              borderRadius: 4,
              marginBottom: 4,
              cursor: "pointer",
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <h2 style={{ marginTop: 24 }}>男性タブ</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {maleTabs.map((tab) => (
          <button
            key={tab}
            style={{
              padding: "4px 8px",
              background: activeTab === tab ? "#0070f3" : "#eee",
              color: activeTab === tab ? "#fff" : "#333",
              border: "none",
              borderRadius: 4,
              marginBottom: 4,
              cursor: "pointer",
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 32, padding: 16, background: "#fafafa", borderRadius: 8 }}>
        <strong>選択中のタブ:</strong> {activeTab}
      </div>
    </div>
  );
}
