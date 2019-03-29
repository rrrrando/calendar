const { parse } = require('url')
const calendar = require('./calendar')

module.exports = async (req, res) => {
  const { query } = parse(req.url, true)
  if (query.id) {
    const cal = await calendar(query.id)
    res.end(cal)
  }
  res.end('Add ?id=TEACHERID as parameter')
}