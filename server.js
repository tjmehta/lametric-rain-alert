const { parse: parseUrl } = require('url')

const DarkSky = require('dark-sky')
const exists = require('exists')
const micro = require('micro')
const normalizeSlashes = require('normalize-slashes')
const usZips = require('us-zips')

const darksky = new DarkSky(process.env.DARK_SKY)

const server = micro(async (req, res) => {
  let { pathname: path, query } = parseUrl(req.url, true /* parseQueryString */)
  path = normalizeSlashes(path)

  console.log('request log:', path, query)
  const { zip } = query
  if (!zip) return void micro.send(res, 400, { error: 'zip is required' })

  const { latitude, longitude } = usZips[zip]
  if (!exists(latitude) || !exists(longitude))
    return void micro.send(res, 400, { error: 'unknown zip' })

  let body
  let statusCode
  try {
    switch (path) {
      case 'forecast':
        // https://api.darksky.net/forecast/[key]/[latitude],[longitude],[time]
        const forecast = await darksky
          .options({
            latitude,
            longitude,
            exclude: ['currently', 'minutely', 'daily', 'alerts']
          })
          .get()
          .catch(err => {
            if (err instanceof Error) throw err
            throw new Error(err)
          })
        statusCode = 200
        body = {
          frames: [
            {
              index: 0,
              chartData: forecast.hourly.data
                .slice(0, 7)
                .map(snapshot => Math.round(snapshot.precipProbability * 100))
            }
          ]
        }
        break
      default:
        statusCode = 404
        body = { error: 'not found' }
        break
    }
  } catch (err) {
    statusCode = 500
    body = { error: 'unknown' }
  }

  micro.send(res, statusCode, body)
})

module.exports = server
