const path = require('path')
const express = require('express')
const hbs = require('hbs')
const socketio = require('socket.io')
const routers = require('./routers/locos')
const http = require('http')
const bodyParser = require('body-parser')
const session = require('express-session')
const mongoose = require('./db_connectors/mongoose_connector')
const MongoStore = require('connect-mongo')(session);
const auth = require('./middleware/auth')
const Locos = require('./models/locos')
const {defaultIMG} = require('./utils/defaultimage')

const {PORT,
  COOKIE_SECRET,
  COOKIE_AGE,
  ENV,
  COOKIE_SID
} = process.env

let SECURE = ENV === 'PROD'

const store = new MongoStore({ 
  mongooseConnection: mongoose.connection,
  autoRemove: 'interval',
  autoRemoveInterval: 120
})

const app = express()

app.use(express.json())
app.use( bodyParser.json() );

app.use(bodyParser.urlencoded({
  extended:true
}))

app.use(session({
  store,
  name: COOKIE_SID,
  saveUninitialized: false,
  resave: false,
  secret: COOKIE_SECRET,
  cookie: {
      maxAge: parseInt(COOKIE_AGE),
      sameSite: true,
      secure: SECURE
  }
}))

app.use(async function (req,res, next){
  const {userId}= req.session
  if(userId){
    let loc = await Locos.findById(userId)
    res.locals.user = loc
  }
  next()
})

app.use(routers)

const viewsPath = path.join(__dirname, '../client/templates/views')
const partialsPath = path.join(__dirname, '../client/templates/partials')
const publicDirectoryPath = path.join(__dirname, '../client/public')

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
app.use(express.static(publicDirectoryPath))

const server = http.createServer(app)
const io = socketio(server)

app.get('', (req, res)=>{

    res.render('home', {
        title : "ALONG LOCOS",
        name: 'AlongLocos(Kerala PUBML)',
        reqNotice : "Recruitment Notice",
        reqNoticeBody : "We are recruiting PUBML players in to our clan.we need competitive and also casual players",
        req:"*REQUIREMENTS*",
        req1:"Players must be participate in given rooms &scrims matches",
        req2:"👌Good game Sense",
        req3:"must be enough to know how to behave in a community.",
        req4:"age 18+",
        req5:"usage of mic with proper communication and call outs",
        req6:"must know Malayalam/English",
        req7:"Rename card",
        note1 : " *NOTE: We will giving more importance to your game sense and skills rather than your kd* ",
        note2 : " *We will giving special importance to competitive players* ",
        note3 : " *We have daily scrims, so if clan leaders are suggested you into room matches then you must need to  play in that scrims*. ",
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title : "About Locos",
        name: 'AlongLocos(Kerala PUBML)',
        page_desc : "Here you add clan details",
        about : " PlayerUnknown’s Battlegrounds (PUBG) is an online multiplayer battle royale game developed and published by PUBG Corporation, a subsidiary of South Korean video game company Bluehole. the game is based on previous mods that were created by Brendan “PlayerUnknown” Greene for other games, inspired by the 2000 Japanese film Battle Royale, and expanded into a standalone game below Greene’s creative direction. in the game, up to 1 hundred players parachute onto an island and scavenge for weapons and instrumentality to kill others while avoiding getting killed themselves. The available safe space of the game’s map decreases in size over time, leading surviving players into tighter areas to force encounters. The last player or team standing wins the round.",
        care : "This Website or Blog is created purely for fun ot entertainment purpose for PUBG mobile clan Along locos. If you want to joing in our clan please contact our leaders",
        copyright :"All files and information contained in this Website or Blog are copyright by Vinsmon TP, and may not be duplicated, copied, modified or adapted, in any way without our written permission. Our Website or Blog may contain our service marks or trademarks as well as those of our affiliates or other companies, in the form of words, graphics, and logos. \n Your use of our Website, Blog or Services does not constitute any right or license for you to use our service marks or trademarks, without the prior written permission of Vinsmon TP. \n The copying, redistribution, use or publication by you of any such Content, is strictly prohibited. Your use of our Website and Services does not grant you any ownership rights to our Content."
    })
})

app.get('/info', (req, res) => {
    res.render('info', {
        title : "Locos Warriors",
        name: 'AlongLocos(Kerala PUBML)',
        page_desc : "Here you can read locs"
    })
})

app.get('/login', auth.redirectToHome, (req, res) => {
  res.render('login', {
      title : "Locos Warriors",
      name: 'AlongLocos(Kerala PUBML)',
      page_desc : "Here you can read locs"
  })
})

app.get('/user', auth.redirectToMain, async(req, res) => {
  const {user} = res.locals
  io.on('connection', (socket) =>{
    let img = defaultIMG
    if(user.avatar){
      img = `data:image/png;base64, ${user.avatar.toString('base64')}`
    }
    socket.emit('profilepic', img)
  })
  res.render('user', {
      title : user.name,
      kd : user.kd,
      email : user.email,
      desc : user.player_desc,
      createdAt : user.createdAt,
      updatedAt : user.updatedAt,
      name: 'AlongLocos(Kerala PUBML)',
      page_desc : "Here you can read locs"
  })
})

io.on('connection', (socket)=>{
    
    async function createGrid(){
        try{
          let result = []
          const columns = 3;
          var rows = 1
          for await (const doc of Locos.find({})) {
            let img = defaultIMG
            if(doc.avatar){
              img = `data:image/png;base64, ${doc.avatar.toString('base64')}`
            }
            result.push({
              name : doc.name,
              kd : doc.kd,
              url : img,
              player_desc : doc.player_desc
            })
          }

          if(result.length % 3 !== 0){
            const defaultData = {
              'url' : defaultIMG,
              'name' : 'Legend yet to born',
              'kd' : 0,
              'player_desc' : 'Anyone interested contact admin'
            }
            if(result.length < columns){
              const missingDetails = columns - result.length
              for(i =0 ; i<missingDetails; i++){
                result.push(defaultData)
              }
            }else{
              const missingDetails = columns - (result.length % columns)
              for(i =0 ; i<missingDetails; i++){
                result.push(defaultData)
              }
            }
          }
          rows = result.length/columns
          socket.emit('gridData', { rows, columns, result })
        }catch(e){
          console.log(e)
        }
      }
      createGrid()
})

server.listen(PORT, ()=>{
    console.log('Server is running...', PORT)
})