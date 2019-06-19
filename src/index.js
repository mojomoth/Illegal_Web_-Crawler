import Sequelize from 'sequelize';
import puppeteer from 'puppeteer';
import config from 'src/config';
import data from 'src/data';

/**
 * Database 
 * The databases from 'config.js' should be created.
 */
const sequelize = new Sequelize(
  config.rdb.database, 
  config.rdb.username, 
  config.rdb.password, 
  {
    host: config.rdb.host,
    dialect: 'mysql',
    logging: config.logging
  },
);

/**
 * Table 
 */
const targets = sequelize.define('target', {
  name: Sequelize.STRING,
  url: Sequelize.STRING,
  count: { 
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
});

/**
 * Table 
 */
const sources = sequelize.define('source', {
  target_id: Sequelize.INTEGER,
  name: Sequelize.STRING,
  url: Sequelize.STRING,
  plain_source: Sequelize.TEXT,
  evaluated_source: Sequelize.TEXT,
});

const crawling = async (browser, target) => {
  const { url, name } = target;

  console.log(`[${name}] GO TO ${url}`);

  // create page tab
  const page = await browser.newPage();

  // go to www
  const response = await page.goto(url);     

  // plain source text
  const plainSource = await response.text();

  // evaluated source text
  const evaluatedSource = await page.evaluate(() => document.body.innerHTML);

  // screen capture
  await page.screenshot({path: `${name}.png`, fullPage: true});

  // close page tab
  await page.close();

  return { plainSource, evaluatedSource };
};

const getTarget = async () => {
  // select one 
  const [target] = await targets.findAll({
    order: [['count', 'ASC']],
    limit: 1
  });

  return target;
};

const updateTarget = async (id, count) => {
  await targets.update(
    { 
      count: count + 1
    },
    {
      where: { id }
    }
  );
};

const insertSource = async (id, name, url, plainSource, evaluatedSource) => {
  await sources.create({
    target_id: id,
    name,
    url,
    plain_source: plainSource,
    evaluated_source: evaluatedSource,
  });
};

// RUN 
(async () => {
  // get count
  let { count } = await targets.findAndCountAll();
  
  if (count === 0) {
    // sync database (reset tables)
    await sequelize.sync({ force: config.forceSync });

    // initialize
    await targets.bulkCreate(data);

    // get count
    count = await targets.findAndCountAll().count;
  }
  
  // create the browser 
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
  });

  // loop
  let condition = 0;
  while (condition < count) {
    const target = await getTarget();

    try {
      const result = await crawling(browser, target);
      await insertSource(
        target.id, 
        target.name, 
        target.url, 
        result.plainSource.replace(/(\t|\n|\s)+/g, ' ').substr(0, 200), 
        result.evaluatedSource.replace(/(\t|\n|\s)+/g, ' ').substr(0, 200)
      );
    } catch (e) {
      console.error(e);
    }

    await updateTarget(target.id, target.count);

    condition ++;
  }

  // close the browser - done! 
  await browser.close();
})();
