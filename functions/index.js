// const functions = require('firebase-functions');
// const { ResultStorage } = require('firebase-functions/lib/providers/testLab');
const app = require('express')()
// const { db, admin } = require('./util/admin')
// var serviceAccount = require("../keys/serviceAccountKey.json");
const cors = require('cors')
const FBAuth = require('./util/fbAuth')



const {getAllScreams, postOneScream, getScream, likeScream , deleteScream, commentOnScream} = require('./handlers/screams')
const {signup, login, uploadImage , addUserDetails,  getAuthenticatedUser} = require('./handlers/users')

var corsOptions = {
    origin: "*"
  };
app.use(cors(corsOptions))
//Screams routes
app.get('/screams', getAllScreams)
app.post('/scream', FBAuth, postOneScream)
app.get('/scream/:screamId', getScream);
app.get('/user', FBAuth, getAuthenticatedUser);
app.delete('/scream/:screamId', FBAuth, deleteScream);
app.get('/scream/:screamId/like', FBAuth, likeScream); 
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);


app.get('/helloWorld',(req,res)=>{
    res.send("hello from firebase")
})


//Users route
app.post('/signup',signup)  


app.post('/login',login)

app.post('/user', FBAuth, addUserDetails);
app.post('/user/image', FBAuth, uploadImage)



// exports.api = functions.region('us-central1').https.onRequest(app)