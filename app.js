const express = require('express')
const app = express()
const port = 3000

app.use(express.urlencoded({ extended: true}))
app.get('/', (req, res) => {
  res.json({
    api :'Wanda '
  })
})


app.use('/users', require('./router/Auth'))
app.use('/data-kopi', require('./router/DataKopi'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})