import pool from "../../db.js";
import {
  getAdvertisements,
  deleteAdvertisements,
  getAdvertisementsCount,
} from "./advertisment.queries.js";

import axios from "axios";
import cheerio from "cheerio";
import puppeteer from "puppeteer";
import format from "pg-format";

export const getAdvertisementsHandler = async (req, res) => {
  try {
    const limit = req.query.limit;
    const currentPage = req.query.currentPage;
    const offset = currentPage * limit;
    const countResponse = await pool.query(getAdvertisementsCount);
    const count = countResponse.rows[0].count;
    await pool.query(
      `SELECT * from advertisements LIMIT ${limit} OFFSET ${offset};`,
      (error, results) => {
        if (error) throw error;
        console.log("Get data rows count", count);
        res.status(200).json({ rows: results.rows, count });
      }
    );
  } catch (e) {
    console.log("get datae", e);
  }
};
const storeAdvertisementsToDB = async (values) => {
  await pool.query(
    format(
      "INSERT INTO advertisements (title, image_url, price) VALUES %L",
      values
    )
  );
};
export const deleteDataHandler = (req, res) => {
  pool.query(deleteAdvertisements, (err, result) => {
    if (err) throw err;
    res.status(200).json({ success: true });
  });
};

export const scrapePageHandler = async (req, res) => {
  const house = req.query.type === "house";
  const pages = 10;
  const allRecords = [];
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || null,
    args: [
      "--no-sandbox",
      "--headless",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });
  const page = await browser.newPage();

  for (let i = 1; i <= 25; i++) {
    const url = house
      ? `https://www.sreality.cz/en/search/for-sale/houses?page=${i}`
      : `https://www.sreality.cz/en/search/for-sale/apartments?page=${i}`;

    await page.goto(url, {
      waitUntil: "load",
      timeout: 100000,
    });
    const results = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".property")).map((node) => {
        let price = node
          .querySelector(".norm-price")
          .innerHTML.replace(/&nbsp;/g, "")
          .replace("CZK", "");
        if (isNaN(price)) {
          price = null;
        }
        return [
          node.querySelector(".name").innerText,
          node.querySelector("img").src,
          price,
        ];
      });
    });
    allRecords.push(...results);
  }
  console.log("before browser close");
  //await browser.close();
  console.log("before after close");

  await storeAdvertisementsToDB(allRecords);
  console.log("await after storeAdvertisementsToDB(al");

  res.status(200).json(true);
};
