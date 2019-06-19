const environment = {
  development: {
    rdb: {
      username: 'root',
      password: '',
      database: 'illegal_web_crawler_test',
      host: 'localhost'
    },
    forceSync: true,
    logging: true,
  },

  test: {
    rdb: {
      username: 'root',
      password: '',
      database: 'illegal_web_crawler_test',
      host: 'localhost'
    },
    forceSync: true,
    logging: false,
  },

  production: {
    rdb: {
      username: 'root',
      password: '',
      database: 'illegal_web_crawler',
      host: 'localhost'
    },
    forceSync: false,
    logging: false,
  }
};

const nodeEnv = process.env.NODE_ENV || 'development';

export default environment[nodeEnv];
