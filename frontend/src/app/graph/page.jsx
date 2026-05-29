"use client";

import { useEffect, useState } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState,
  useEdgesState
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { Network } from "lucide-react";

export default function GraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/graph");
        if (res.ok) {
          const data = await res.json();
          console.log("Graph data received:", data);
          
          if (!data.nodes || data.nodes.length === 0) {
            console.log("No data returned from backend");
            return;
          }
          
          const files = data.nodes.filter(n => n.group === "File");
          const concepts = data.nodes.filter(n => n.group !== "File");
          
          const centerX = 800;
          const centerY = 600;

          const getPosition = (node) => {
            if (node.group === "File") {
              const i = files.findIndex(f => f.id === node.id);
              const angle = (i / Math.max(1, files.length)) * 2 * Math.PI;
              return {
                x: centerX + Math.cos(angle) * 550,
                y: centerY + Math.sin(angle) * 550
              };
            } else {
              const i = concepts.findIndex(c => c.id === node.id);
              const angle = (i / Math.max(1, concepts.length)) * 2 * Math.PI;
              const radius = 250 + (i % 2 === 0 ? 50 : 0); 
              return {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
              };
            }
          };

          const formattedNodes = data.nodes.map(n => ({
            id: String(n.id),
            position: getPosition(n),
            data: { label: n.label || String(n.id) },
            style: {
              background: n.group === "Concept" ? "#3b82f6" : "#27272a",
              color: "#fff",
              border: n.group === "Concept" ? "none" : "1px solid #3f3f46",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "12px",
              width: 150,
              textAlign: "center",
              boxShadow: n.group === "File" ? "0 4px 6px -1px rgba(0, 0, 0, 0.5)" : "none"
            }
          }));
          
          const formattedEdges = data.links.map((l, i) => ({
            id: `e${l.source}-${l.target}-${i}`,
            source: String(l.source),
            target: String(l.target),
            label: l.label,
            animated: true,
            style: { stroke: "#3b82f6", strokeWidth: 1.5 }
          }));

          setNodes(formattedNodes);
          setEdges(formattedEdges);
        }
      } catch (err) {
        console.error("Failed to fetch graph:", err);
      }
    };
    fetchGraph();
  }, []);

  return (
    <div className="flex-1 flex flex-col relative w-full h-full">
      <div className="px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Network className="w-6 h-6 text-blue-500" />
          Relationship Graph
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Interactive visualization of your memory network.</p>
      </div>
      
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#555" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
