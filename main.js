const { parseISO, isValid } = require('date-fns');
require('dotenv').config();
const MyScrape = require('./MyScrape');

const myScrape = new MyScrape();
const baseURL = '';
const time = {
    today: 't',
    yesterday: 'ld',
}
const projects = [
];

const handleOnProject = async (page, projectName, paramInput) => {
    const url = `/projects/${projectName}/time_entries?utf8=✓&set_filter=1&sort=spent_on:desc&f[]=spent_on&op[spent_on]=${paramInput}&f[]=user_id&op[user_id]==&v[user_id][]=me&f[]=&c[]=spent_on&c[]=user&c[]=activity&c[]=issue&c[]=comments&c[]=hours&c[]=issue.status&group_by=&t[]=hours&t[]=`;
    await page.goto(`${baseURL}${url}`, { waitUntil: 'domcontentloaded' });

    const timeList = await page.evaluate(() => {
        const table = document.querySelector('table.time-entries');

        if (!table) {
            return [];
        }

        const tableRows = table.querySelectorAll('tr');

        let titles = [];

        tableRows.forEach((element, index) => {
            if (index === 0) {
                return;
            }
            const colName = element.querySelector('td:nth-child(5)');
            const colTime = element.querySelector('td:nth-child(7)');
            const colStatus = element.querySelector('td:nth-child(8)');

            const title = colName.textContent.trim();
            const indexToRemove = title.indexOf(':') + 2;
            const issueName = title.slice(indexToRemove);
            const time = Number(colTime.textContent.trim() || 0);

            titles.push({
                link: colName.querySelector('a').href,
                title: issueName,
                time: time,
                status: colStatus.textContent.trim()
            });
        });

        return titles;
    });

    return timeList || [];
}

const handleProcess = async (page, paramInput) => {
    let list = [];

    // projects.forEach(async (projectName) => {
    //     const times = await handleOnProject(page, projectName);
    //     timeList.push(...times);
    // });
    if (projects.length === 0) {
        return;
    }

    const timeList1 = await handleOnProject(page, projects[0], paramInput);
    list.push(...timeList1);

    const project2 = await handleOnProject(page, projects[1], paramInput);
    list.push(...project2);

    const project3 = await handleOnProject(page, projects[2], paramInput);
    list.push(...project3);

    return list;
}

const reportResult = async (items) => {
    if (!items || items.length === 0) {
        console.log('No data to report!');

        return true;
    }
    
    const currentTime = new Date();
    const fileName = `report_${currentTime.getDate()}_${currentTime.getMonth() + 1}_${currentTime.getFullYear()}.html`;
    let tasks = '';
    let spendTime = 0;

    items.forEach((item) => {
        tasks += `<li><a href="${item.link}">${item.title}</a> -> (${item.status})</li>`;
        spendTime += item.time;
    });

    const reportTemplate = ``;

    console.log('Your spend time today =', spendTime);
    console.log('Your report file at =', __dirname + `/reports/${fileName}`);

    await myScrape.writeFile(`reports/${fileName}`, reportTemplate);
}

isValidDateFormat = (dateString) => {
    try {
        const parsedDate = parseISO(dateString);
        return isValid(parsedDate) && dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
    } catch (error) {
        return false;
    }
}

getParam = () => {
    const args = process.argv;

    if (args.length < 3) {
        return time.today;
    } else {
        const param = args[2].trim().toLowerCase().replace('--date=', '');
    
        if (param === 'y') {
            return time.yesterday;
        } else {
            if (isValidDateFormat(param)) {
                return `=&v[spent_on][]=${param}`;
            } else {
                console.log('Invalid date');

                return false;
            }
        }
    }
}

const main = async () => {
    let page = null;
    let browser = null;

    try {
        const paramInput = getParam();

        if (paramInput != false) {
            const app = await myScrape.startApp();
            page = app.page;
            browser = app.browser;

            await myScrape.login(
                page,
                {
                    username: process.env.USER_NAME,
                    password: process.env.PASSWORD
                },
                {
                    user: '#username',
                    pass: '#password',
                    btnSubmit: '#login-submit'
                },
                `${baseURL}/login`
            );

            const items = await handleProcess(page, paramInput);

            await reportResult(items);
        }
    } catch (error) {
        console.error('ERROR:', error.message);
    } finally {
        if (browser) {
            await myScrape.closeBrowser(browser);
        }

        myScrape.exitApp('Done!');
    }
}

main();
