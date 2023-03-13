import React from "react";
import Title from "../components/controls/Title";
import Advertisements from "../components/Advertisements";
export default function HomePage() {
  return (
    <div>
      <Title>
        List of Advertisements from
        <img
          src="https://www.sreality.cz/img/logo-sreality.svg"
          alt="sreality"
          className="sreality"
        />
      </Title>
      <Advertisements />
    </div>
  );
}
