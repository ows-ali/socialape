const functions = require('firebase-functions');
const { ResultStorage } = require('firebase-functions/lib/providers/testLab');
const app = require('express')()
// const { db, admin } = require('./util/admin')
// var serviceAccount = require("../keys/serviceAccountKey.json");

const FBAuth = require('./util/fbAuth')



const {getAllScreams, postOneScream } = require('./handlers/screams')
const {signup, login, uploadImage } = require('./handlers/users')


//Screams routes
app.get('/screams', getAllScreams)
app.post('/scream', FBAuth, postOneScream)

app.get('/helloWorld',(req,res)=>{
    res.send("hello from firebase")
})


//Users route
app.post('/signup',signup)  


app.post('/login',login)


app.post('/uploadImage', FBAuth, uploadImage)



exports.api = functions.https.onRequest(app)