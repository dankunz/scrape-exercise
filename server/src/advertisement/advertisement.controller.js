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

const deleteAll = async () => {
  await pool.query(deleteAdvertisements, (err, result) => {
    console.log("Deleted");
  });
};
export const deleteDataHandler = async (req, res) => {
  await deleteAll();
  res.status(200).json({ success: true });
};

export const scrapePageHandler = async (req, res) => {
  console.log("Deleting Old");
  await deleteAll();
  const house = req.query.type === "house";
  const pages = 25;
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

  for (let i = 1; i <= pages; i++) {
    console.log(`Page ${i} of ${pages}`);
    const url = house
      ? `https://www.sreality.cz/en/search/for-sale/houses?page=${i}`
      : `https://www.sreality.cz/en/search/for-sale/apartments?page=${i}`;

    await page.goto(url, {
      waitUntil: "load",
      timeout: 500000,
    });
    const results = await page.evaluate(() => {
      try {
        return Array.from(document.querySelectorAll(".property")).map(
          (node) => {
            let price = node
              .querySelector(".norm-price")
              .innerHTML.replace(/&nbsp;/g, "")
              .replace("CZK", "");
            if (isNaN(price)) {
              price = null;
            }
            const a = [
              node.querySelector(".name").innerText,
              node.querySelector("img").src,
              price,
            ];
            console.log(a);
            return a;
          }
        );
      } catch (e) {
        console.log("Catched Error", e);
      }
    });

    allRecords.push(...results);
  }
  console.log("before browser close");
  //await browser.close();
  console.log("before after close");

  await storeAdvertisementsToDB(allRecords);
  console.log("await after store");

  res.status(200).json(true);
};
