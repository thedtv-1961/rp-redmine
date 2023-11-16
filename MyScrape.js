const puppeteer = require('puppeteer');
const fs = require('fs');
const fss = fs.promises;
const cookiesPath = './data/cookies.json';

class MyScrape {
    // Start app:
    // return {browser, page};
    startApp = async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        return { browser, page };
    }

    // Close browser:
    closeBrowser = async (browser) => {
        await browser.close();
    }

    // Exit app:
    exitApp = (message = null) => {
        if (message) {
            console.log(message);
        }

        process.exit();
    }

    // Login:
    // credentialElements = {
    //     user,
    //     pass,
    //     btnSubmit
    // }
    // credentials = {
    //     username,
    //     password
    // }
    login = async (page, credentials, credentialElements, loginUrl) => {
        if (fs.existsSync(cookiesPath)) {
            await this.loadCookies(page);
        }

        await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

        if (await this.checkIsLoggedIn(page)) {
            console.log('Logged in!');

            return true;
        }

        await page.type(credentialElements.user, credentials.username);
        await page.type(credentialElements.pass, credentials.password);
        await page.click(credentialElements.btnSubmit);

        await page.waitForNavigation();
        await this.saveCookies(page);

        if (await this.checkIsLoggedIn(page)) {
            console.log('Login success!');
        } else {
            console.log('Login failed!');
        }
    }

    checkIsLoggedIn = async (page) => {
        const myName = await page.$('.my-page');

        if (myName) {
            return true;
        }

        return false;
    }

    saveCookies = async (page) => {
        const cookies = await page.cookies();
        await fss.writeFile(cookiesPath, JSON.stringify(cookies));
    }

    loadCookies = async (page) => {
        try {
            const cookies = JSON.parse(await fss.readFile(cookiesPath));
            await page.setCookie(...cookies);
        } catch (error) {
            console.error('Can not read cookies:', error.message);
        }
    }

    testUrl = async (url, isCapture) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        if (isCapture) {
            await page.screenshot({ path: 'capture.png' });
            await this.capture(page, 'capture2.png')
        }

        await browser.close();
    }

    capture = async (page, fileName) => {
        await page.screenshot({ 'path': `screenshots/${fileName}` });
    }

    writeFile = async (fileName, content) => {
        await fss.writeFile(fileName, content);
    }
}


module.exports = MyScrape;
