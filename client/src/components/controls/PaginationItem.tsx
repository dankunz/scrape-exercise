import React from "react";
import "./PaginationItem.css";

type PaginationItemType = {
  onPageChange: (n: number) => void;
  pageNumber: number;
  active: boolean;
};

export default function PaginationItem({
  onPageChange,
  pageNumber,
  active,
}: PaginationItemType) {
  function handleClick() {
    onPageChange(pageNumber - 1);
    window.scrollTo(0, 0);
  }
  return (
    <div
      onClick={handleClick}
      className={`pagination-item ${active ? "active" : ""}`}
    >
      {pageNumber}
    </div>
  );
}
