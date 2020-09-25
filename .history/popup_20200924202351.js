const puppeteer = require('puppeteer');

const express = require('express');
const app = express();
const port = 3000;

app.get('/', async (req, res) => {
    const {url} = req.query;
    if(!url) {
        res.status(400).send("Bad request: 'url' param is missing!");
        return;
    }

    try {
        const html = await getPageHTML(url);

        res.status(200).send(html);
    } catch (error) {
        res.status(500).send(error);
    }
});

const getPageHTML = async (pageUrl) => {
    const browser = await puppeteer.launch();
  
    const page = await browser.newPage();
  
    await page.goto(pageUrl);
  
    const pageHTML = await page.evaluate('new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML');
  
    await browser.close();
  
    return pageHTML;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))