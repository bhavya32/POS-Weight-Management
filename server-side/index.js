const express = require('express')
const app = express()
const port = 4328

app.get('/update', function (req, res) {
    console.log(req.query)
    res.end("ok")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})