"use client";

import React, { useEffect, useRef } from "react";
import Experience from "./Experience/Experience.js";
import "./Experience/style.css";

const OrganicSphere = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const experience = new Experience({
        targetElement: canvasRef.current,
      });
      return () => {
        experience.destroy();
      };
    }
  }, []);

  return <div ref={canvasRef} className="experience" />;
};

export default OrganicSphere;
