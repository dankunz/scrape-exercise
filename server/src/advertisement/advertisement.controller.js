import {
  deleteAdvertisements,
  getAdvertisementsCount,
} from "./advertisment.queries.js";

import format from "pg-format";
import pool from "../../db.js";
import puppeteer from "puppeteer";

export const getAdvertisementsHandler = async (req, res) => {
  try {
    const limit = req.query.limit;
    const currentPage = req.query.currentPage;
    const offset = currentPage * limit;
    const countResponse = await pool.query(getAdvertisementsCount);
    const count = countResponse.rows[0].count;
    pool.query(
      `SELECT * from advertisements LIMIT ${limit} OFFSET ${offset};`,
      (error, results) => {
        if (error) throw error;
        res.status(200).json({ rows: results.rows, count });
      }
    );
  } catch (e) {
    console.log("Database was not preperad yet please reset docker", e);
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
  await pool.query(deleteAdvertisements);
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
  await puppeteer
    .launch({
      headless: true,
      executablePath: process.env.CHROME_BIN || null,
      args: [
        "--no-sandbox",
        "--headless",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
    })
    .then(async (browser) => {
      for (let i = 1; i <= pages; i++) {
        console.log(`Page ${i} of ${pages}`);
        const url = house
          ? `https://www.sreality.cz/en/search/for-sale/houses?page=${i}`
          : `https://www.sreality.cz/en/search/for-sale/apartments?page=${i}`;

        const page = await browser.newPage();
        try {
          await page
            .goto(url, {
              waitUntil: "load",
            })
            .then(
              async () =>
                await page
                  .evaluate(() => {
                    return Array.from(
                      document.querySelectorAll(".property")
                    ).map((node) => {
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
                  })
                  .then((results) => {
                    allRecords.push(...results);
                  })
            );
        } catch (e) {
          console.log(`Data from page: ${i}, could not be loaded`);
        }
      }
    });
  console.log("Storing");
  await storeAdvertisementsToDB(allRecords);
  console.log("Done");

  res.status(200).json(true);
};
