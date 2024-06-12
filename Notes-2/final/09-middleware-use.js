const express = require('express')
const app = express()
const logger = require('./logger')
const authorize = require('./authorize')
//  req => middleware => res
app.use([logger, authorize])

//if app.use('/api',logger)-->loggerwill be applied to any route after /api
// api/home/about/products--> applieslogger to home aswell

app.get('/', (req, res) => {
  res.send('Home')
})
app.get('/about', (req, res) => {
  res.send('About')
})
app.get('/api/products', (req, res) => {
  res.send('Products')
})
app.get('/api/items', (req, res) => {
  console.log(req.user)
  //{name:'john',id:3}
  res.send('Items')
})

app.listen(5000, () => {
  console.log('Server is listening on port 5000....')
})
