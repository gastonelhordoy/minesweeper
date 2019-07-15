/* eslint-env mocha */
'use strict'

// useful docs for testing
// https://scotch.io/tutorials/test-a-node-restful-api-with-mocha-and-chai
// http://mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai/#.WMgfgRLytE4
// http://stackoverflow.com/questions/20548723/how-do-you-structure-your-tests-for-your-server-applications-in-node-js
// https://codeforgeek.com/2015/07/unit-testing-nodejs-application-using-mocha/
// http://willi.am/node-mocha-supertest/
// http://www.marcusoft.net/2015/04/supertest-things-ive-learned-part-i.html

let platform

before(() => {
  return require('./utils')()
    .then(newPlatform => {
      platform = newPlatform
      return platform.initData()
    })
})

after(() => {
  return platform.shutdown()
})

// before(() => {
//   return require('./utils/bootstrap')()
//   .then(() => {
//     require('./auth/auth.login.spec');
//   });
// });

// // this is a required placeholder for asynchronously define test suites with mocha
// // https://github.com/mochajs/mocha/issues/1483#issuecomment-192479099
// //
// // delay flag does not work for this
// // https://github.com/mochajs/mocha/issues/2257
// it('This is a required placeholder to allow before() to work', () => {
//   console.log('Mocha should not require this hack IMHO');
// });
