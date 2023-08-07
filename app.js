import express from "express";
import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();
const app = express();
const port = process.env.PORT;
const CONVERSATION_PATTERN = "FPT";
const MESSAGE_TEMPLATE =
  "Help me generate 10 question with information belowIntroduction Nest (NestJS) is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming). Under the hood, Nest makes use of robust HTTP Server frameworks like Express (the default) and optionally can be configured to use Fastify as well! Nest provides a level of abstraction above these common Node.js frameworks (Express/Fastify), but also exposes their APIs directly to the developer. This gives developers the freedom to use the myriad of third-party modules which are available for the underlying platform.";

app.get("/", async (req, res) => {
  try {
    const messages = [];
    await test(res)

    res.send(content);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error crawling data.");
  }
});

const test = async (res) => {
  const path = "https://chat.openai.com/auth/login";
  const email = "bidinos1804@gmail.com";
  const password = "Vungbthe130343";

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(path);

  // Wait for necessary elements to load
  await selectorButton(page, "button");

  // input email
  await selectorInput(page, "input#username", email);

  // submit verify email
  await selectorButton(page, 'button[type="submit"]', false);

  // input password
  await selectorInput(page, "input#password", password);

  await selectorButton(
    page,
    'button[type="submit"][name="action"][data-action-button-primary="true"]'
  );
  await selectorButton(page, 'button[as="button"]', false);
  await selectElementWithText(page, 'button[as="button"]', "Next");
  await selectElementWithText(page, 'button[as="button"]', "Done");
  await page.waitForTimeout(3000);
  await selectElementWithText(page);
  await page.waitForTimeout(3000);

  // typing prompt textarea
  const message = MESSAGE_TEMPLATE;
  await page.$eval("textarea#prompt-textarea", (e) => e.blur());
  const inputSelect = "textarea#prompt-textarea";
  await page.waitForSelector(inputSelect, {
    visible: true,
    timeout: 60000,
  });
  await page.$eval(inputSelect, (e) => e.focus());

  const textareaHandle = await page.$(inputSelect);
  if (textareaHandle) {
    await textareaHandle.type(message);
  }

  await selectorButton(
    page,
    'button[style="background-color: rgb(25, 195, 125);"]',
    false
  );

  const content = await page.content();
  
  await page.screenshot({ path: "test.png" });
  await browser.close();
  if(content) {
    await res.send({content: content});
  }
  res.send({ content: "Loading..."})
};

const selectorButton = async (page, selector, isNavigation = true) => {
  const buttonSelector = selector ?? 'button[type="submit"]';
  await page.waitForSelector(buttonSelector, { visible: true, timeout: 60000 });
  await page.click(buttonSelector);
  if (isNavigation) {
    await page.waitForNavigation();
  }
};

const selectorInput = async (page, selector, value) => {
  const inputSelect = selector ?? "input#username";
  await page.waitForSelector(inputSelect, {
    visible: true,
    timeout: 60000,
  });
  await page.type(inputSelect, value);
};

const selectElementWithText = async (page, selector, pattern) => {
  const patternName = pattern ?? CONVERSATION_PATTERN;
  const selectorName =
    selector ??
    "div.flex-1.text-ellipsis.max-h-5.overflow-hidden.break-all.relative";
  const elements = await page.$$(selectorName);
  for (let i = 0; i < elements.length; i++) {
    const currentElement = elements[i];
    if (currentElement) {
      const innerText = await currentElement.evaluate(
        (element) => element.innerText
      );
      if (innerText && innerText.includes(patternName)) {
        await currentElement.click();
      }
    }
  }
};

app.listen(port, () => {
  console.log(`Example app listening on port http:localhost:${port}`);
});
