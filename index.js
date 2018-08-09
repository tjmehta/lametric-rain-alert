require('envc')()
console.log('ENV', {
  DARK_SKY: process.env.DARK_SKY,
  PORT: process.env.PORT
})

const App = require('./app.js')

const server = require('./server')
const app = new App(server)
app.start()
process.on('SIGINT', () => app.stop())
