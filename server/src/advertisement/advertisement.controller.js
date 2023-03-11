import pool from "../../db.js";
import {
  getAdvertisements,
  deleteAdvertisements,
} from "./advertisment.queries.js";

import axios from "axios";
import cheerio from "cheerio";
import puppeteer from "puppeteer";
import format from "pg-format";

export const getAdvertisementsHandler = async (req, res) => {
  const limit = req.query.limit;
  const currentPage = req.query.currentPage;
  const offset = currentPage * limit;
  const countResponse = await pool.query(
    "SELECT COUNT(*) FROM advertisements;"
  );
  const count = countResponse.rows[0].count;
  const advertisements = pool.query(
    `SELECT * from advertisements LIMIT ${limit} OFFSET ${offset};`,
    (error, results) => {
      if (error) throw error;
      res.status(200).json({ rows: results.rows, count });
    }
  );
};
const storeAdvertisementsToDB = (values) => {
  pool.query(
    format(
      "INSERT INTO advertisements (title, image_url, price) VALUES %L",
      values
    ),
    [],
    (err, result) => {
      console.log("stored");
    }
  );
};
export const deleteDataHandler = (req, res) => {
  pool.query(deleteAdvertisements, (err, result) => {
    res.status(200).json({ success: true });
  });
};

export const scrapePageHandler = async (req, res) => {
  const house = req.query.type === "house";
  console.log("house", house);
  console.log("house", req.query);
  const pages = 5;
  const allRecords = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  for (let i = 1; i <= pages; i++) {
    const url = house
      ? `https://www.sreality.cz/en/search/for-sale/houses?page=${i}`
      : `https://www.sreality.cz/en/search/for-sale/apartments?page=${i}`;

    await page.goto(url);
    await page.screenshot({ path: "aha.png" });
    const a = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".property")).map((node) => {
        return node.querySelector("img");
      });
    });
    const arr = [];
    const results = await page.$$eval(".property", (nodes) => {
      const info = [];
      nodes.forEach((node) => {
        info.push([
          node.querySelector(".name").innerText,
          node.querySelector("img").src,
          parseInt(
            node
              .querySelector(".norm-price")
              .innerHTML.replaceAll("&nbsp;", "")
              .replace("CZK", "")
          ),
        ]);
      });

      return info;
    });
    allRecords.push(...results);
  }
  await browser.close();
  storeAdvertisementsToDB(allRecords);
  //Save To DB
  res.status(200).json(allRecords);
};
