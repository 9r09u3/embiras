// components/TabBar.tsx
"use client";
export default function TabBar({ active, onChange }: any) {
  return (
    <div style={{ position: "fixed", left: 12, right: 12, bottom: 12, display: "flex", gap: 12, zIndex: 10030 }}>
      <button className={`tab-btn ${active === "map" ? "active" : ""}`} onClick={() => onChange("map")} style={{ flex: 1, padding: 12, borderRadius: 12, background: active==="map" ? "#ff8c42":"#fff", color: active==="map" ? "#111":"#111", boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>Mapa</button>
      <button className={`tab-btn ${active === "ranking" ? "active" : ""}`} onClick={() => onChange("ranking")} style={{ flex: 1, padding: 12, borderRadius: 12, background: active==="ranking" ? "#ff8c42":"#fff", color: active==="ranking" ? "#111":"#111", boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>Ranking</button>
    </div>
  );
}
