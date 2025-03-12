import puppeteer from 'puppeteer';
import path from 'path'

// Or import puppeteer from 'puppeteer-core';

// Launch the browser and open a new blank page
const browser = await puppeteer.launch({headless: false, userDataDir: './chrome-data', args: ['--disable-features=LookalikeUrlNavigationSuggestionsUI']});
const page = await browser.newPage();
const delay = (ms:number) => new Promise(res => setTimeout(res, ms));


const session = await browser.target().createCDPSession();
await session.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: path.resolve('./tmp/'),
    eventsEnabled: true
});

const waitUntilDownload = async ()  => {
    return new Promise<void>((resolve, reject) => {
        session.on('Browser.downloadProgress', (e:any) => { // or 'Browser.downloadProgress'
            console.dir(e)
            if (e.state === 'completed') {
                session.removeAllListeners('Browser.downloadProgress')
                resolve()
            } else if (e.state === 'canceled') {
                reject();
            }
        });
    });
}

const keypress = async () => {
    process.stdin.setRawMode(true)
    return new Promise<void>(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false)
        resolve()
    }))
}

const exportBoard  = async (id:string, title: string) => {
    await page.goto(`https://miro.com/app/board/${id}/`)
    await delay(2000)
    await (await page.waitForSelector('::-p-xpath(//button[@data-testid="iframe-modal-dialog-close"])', {timeout: 120_000}))?.click()
    await delay(2000)
    console.log(`Press any key to continue export`)
    await keypress()
    console.log(`Exporting ...${title}`)
    await (await page.waitForSelector('::-p-xpath(//button[@aria-label="Main menu"])', {timeout: 120_000}))?.click()
    await delay(1000)
    await (await page.waitForSelector('::-p-xpath(//div[@role="menuitem" and @aria-label="Board"])', {timeout: 120_000}))?.click()
    await delay(1000)
    await (await page.waitForSelector('::-p-xpath(//div[@role="menuitem" and @aria-label="Export"])', {timeout: 120_000}))?.click()

    //Save as PDF
    await delay(1000)
    await (await page.waitForSelector('::-p-xpath(//div[@role="menuitem" and @aria-label="Save as PDF"])', {timeout: 120_000}))?.click()
    await delay(1000)
    await page.waitForSelector('::-p-xpath(//button[@data-testid="export-quality-settings-dialog__export-button"])', {timeout: 120_000})
    await delay(1000)
    await (await page.waitForSelector('::-p-xpath(//label[@data-testid="exportQuality__radio_vector"])', {timeout: 120_000}))?.click()
    await delay(1000)
    await (await page.waitForSelector('::-p-xpath(//button[@data-testid="export-quality-settings-dialog__export-button"])', {timeout: 120_000}))?.click()
    await waitUntilDownload()
    //Save as Image
    /*
    await delay(5000)
    await (await page.waitForSelector('::-p-xpath(//div[@role="menuitem" and @aria-label="Save as image"])', {timeout: 120_000}))?.click()
    await delay(5000)
    await page.waitForSelector('::-p-xpath(//button[@data-testid="export-quality-settings-dialog__export-button"])', {timeout: 120_000})
    await delay(5000)
    await (await page.waitForSelector('::-p-xpath(//label[@data-testid="exportQuality__radio_vector"])', {timeout: 120_000}))?.click()
    await delay(5000)
    await page.waitForSelector('::-p-xpath(//button[@data-testid="export-quality-settings-dialog__export-button"])', {timeout: 120_000})
    await delay(5000)
    */
    //await page.setRequestInterception(true);
    //await page.goto(`https://svc.eu01.miro.com/svg-convert/convert-board`)
    


}


//console.log('warm up')
//await page.goto('chrome://settings/')
//await delay(120_000)

// Navigate the page to a URL.
await page.goto('https://miro.com/app/dashboard/');


// Set screen size.
await page.setViewport({width: 1200, height: 1024});


await page.waitForSelector('::-p-xpath(//div[@data-testid="user-switcher__root"])', {timeout: 120_000})


await page.goto('https://miro.com/api/v1/boards/?fields=id%2Ctitle&filter=OWNER&sort=LAST_OPENED&offset=0&limit=400');

const bodyHandle = await page.$('body');
const boards = JSON.parse(await page.evaluate(body => body?.innerText, bodyHandle) as string);
for (const board of boards.data) {
    await exportBoard(board.id, board.title)
    //break;
}
console.log('Done!')
//await delay(120_000)
await browser.close();




//https://miro.com/api/v1/boards/?filter=OWNER&sort=LAST_OPENED&offset=0&limit=400


