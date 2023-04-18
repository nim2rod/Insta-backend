var config

if (true || process.env.NODE_ENV === 'production') {
  config = require('./prod')
  console.log('config', config);
} else {
  config = require('./dev')
}
module.exports = config