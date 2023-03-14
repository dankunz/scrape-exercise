import "./Advertisements.css";

import React, { useEffect, useState } from "react";

import Advertisement from "./controls/Advertisement";
import { AdvertisementType } from "../types/AdvertisementsTypes";
import { Bars } from "react-loader-spinner";
import Pagianation from "./Pagination";
import axios from "axios";

const perPageOptions = [{ value: 20 }, { value: 50 }, { value: 100 }];
type GetDataResponse = {
  data: {
    rows: AdvertisementType[];
    count: number;
  };
};
const API_URL = "/api/v1/";
export default function Advertisements() {
  const [data, setData] = useState<AdvertisementType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(20);
  const [isLoading, setIsloading] = useState<boolean>(false);

  const fetchData = () => {
    console.log("fetching Data");
    setIsloading(true);
    axios
      .get(`${API_URL}advertisement?currentPage=${currentPage}&limit=${limit}`)
      .then((response: GetDataResponse) => {
        setData(response.data.rows);
        setTotalCount(response.data.count);
      })
      .finally(() => setIsloading(false));
  };
  useEffect(() => {
    fetchData();
  }, [currentPage, limit]);

  function scrapeData(type: string) {
    setIsloading(true);

    axios
      .post(`${API_URL}advertisement/scrapePage?type=${type}`)
      .catch((e) => console.log("error scrapePage", e))
      .finally(() => {
        setIsloading(false);
        fetchData();
      });
  }
  function deleteData() {
    console.log("scrapeData");
    axios.post(`${API_URL}advertisement/deleteData`).then(() => {
      fetchData();
    });
  }
  return (
    <div className="advertisements-wrapper">
      <div className="top-bar">
        <button onClick={() => scrapeData("flat")}>Scrape Flat data</button>
        <button onClick={() => scrapeData("house")}>Scrape House data</button>
        <button onClick={deleteData}>Delete data</button>
        <select
          onChange={(e) => {
            setCurrentPage(0);
            setLimit(Number(e.target.value));
          }}
          className="per-page-select"
        >
          {perPageOptions.map((p) => (
            <option key={p.value} value={p.value}>
              {p.value} per page
            </option>
          ))}
        </select>
      </div>
      {isLoading && (
        <div className="loading-bars-wrapper">
          <Bars
            height="80"
            width="80"
            color="#4d3737"
            ariaLabel="bars-loading"
            wrapperStyle={{ position: "absolute", top: "50%", left: "50%" }}
            wrapperClass=""
            visible={isLoading}
          />
        </div>
      )}
      <div className="advertisements">
        {data.map((item: AdvertisementType) => {
          return <Advertisement key={`advertisement-${item.id}`} item={item} />;
        })}
      </div>

      {data.length === 0 && !isLoading && <i className="no-data">No data</i>}
      <Pagianation
        currentPage={currentPage}
        recordCount={totalCount}
        limit={limit}
        onPageChange={(newPage) => setCurrentPage(newPage)}
      />
    </div>
  );
}
