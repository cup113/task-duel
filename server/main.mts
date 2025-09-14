import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import router from './routes/index.mjs'
import compression from 'compression'

const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())
app.use(compression())
app.use("/api", router)
app.use("/", express.static('./dist'))

const PORT = process.env.PORT || 4136
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
