import "./Advertisement.css";

import { AdvertisementType } from "../../types/AdvertisementsTypes";
import React from "react";

export default function Advertisment({ item }: { item: AdvertisementType }) {
  const price =
    item.price &&
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      maximumSignificantDigits: 2,
      currency: "CZK",
    }).format(item.price);
  return (
    <div key={item.id} className="advertisement">
      <img src={item.image_url} alt="" />
      <div className="text-info">
        <div className="item-title">{item.title}</div>
        <div className="price">{price || "Not specified"}</div>
      </div>
    </div>
  );
}
