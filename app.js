class App {
  constructor(server) {
    this.server = server
    this._startingPromise = null
    this._stoppingPromise = null
  }
  async start() {
    if (this._startingPromise) {
      console.log('server already starting...')
      return this._startingPromise
    }
    if (this._stoppingPromise) {
      return this._stoppingPromise.then(() => this.start())
    }
    console.log('server starting...')
    const server = this.server
    this._startingPromise =
      this._startingPromise ||
      new Promise((resolve, reject) => {
        const PORT = process.env.PORT || 3030
        server.listen(PORT, err => {
          if (err) return void reject(err)
          console.log(`server started! port: ${PORT}`)
          resolve()
        })
      })
    return this._startingPromise.then(() => {
      delete this._startingPromise
    })
  }
  async stop() {
    if (this._stoppingPromise) {
      console.log('server already stopping')
      return this._stoppingPromise
    }
    if (this._startingPromise) {
      return this._startingPromise.then(() => this.stop())
    }
    console.log('server stopping...')
    const server = this.server
    this._stoppingPromise =
      this._stoppingPromise ||
      new Promise((resolve, reject) => {
        server.close(err => {
          if (err) return void reject(err)
          console.log('server stopped!')
          resolve()
        })
      })
    return this._stoppingPromise.then(() => {
      delete this._stoppingPromise
    })
  }
}

module.exports = App
