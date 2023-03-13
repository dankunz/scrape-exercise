import React from "react";
import "./Title.css";
export default function Title({ children }: { children: any }) {
  return <span className="title">{children}</span>;
}
