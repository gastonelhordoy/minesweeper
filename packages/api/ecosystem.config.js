/* eslint-disable */

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    // First application
    {
      name      : 'app',
      script    : 'app.js',
      // env: {
      //   COMMON_VARIABLE: 'true'
      // },
      env_production : {
        NODE_ENV: 'production'
      },
      log_file    : '/var/apps/app.log',
      error_file  : '/var/apps/app.err.log',
      out_file    : '/var/apps/app.out.log',
      merge_logs  : true,
      log_date_format : 'YYYY-MM-DD HH:mm:ss.SSS Z'
    }
  ]
};
