const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { ResultStorage } = require('firebase-functions/lib/providers/testLab');
const app = require('express')()

// var serviceAccount = require("../keys/serviceAccountKey.json");

admin.initializeApp(
    {
  credential: admin.credential.cert(require("./keys/serviceAccountKey.json")),
  databaseURL: "https://socialape-93f08.firebaseio.com"
}
);

const config = {
    apiKey: "AIzaSyBNnpgkzk745U0LiXFqZHRP3BJjJQaPYqE",
    authDomain: "socialape-93f08.firebaseapp.com",
    databaseURL: "https://socialape-93f08.firebaseio.com",
    projectId: "socialape-93f08",
    storageBucket: "socialape-93f08.appspot.com",
    messagingSenderId: "342480568048",
    appId: "1:342480568048:web:2030a883e0acb192200c35",
    measurementId: "G-Y74EXM8E2W"
  };
  const firebase = require('firebase')

  firebase.initializeApp(config)
// admin.initializeApp({   credential: admin.credential.applicationDefault() });

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// const db = admin.firestore()


app.get('/screams',(req,res) => {
    admin.firestore()
    .collection('screams')
    .orderBy('createdAt','desc')
    .get()
    .then(data => {
        console.log(data)
        let screams = []
        data.forEach(doc=>{
              screams.push({
                screamId: doc.id,
                userHandle: doc.data().userHandle,
                body:doc.data().body,
                createdAt:doc.data().createdAt
              })
        })
        console.log(screams,'screams')
 
        return res.json(screams)
    })
    .catch(err=>console.error(err))
})

app.get('/helloWorld',(req,res)=>{
    res.send("hello from firebase")
})



app.post('/signup',(req,res)=>{


    // if (req.method !== 'POST')
    // {
    //     return res.status(400).json({error: "Method not allowed."})
    // }
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.password,
        handle: req.body.handle,
        // createdAt: new Date().toISOString()
    }
    console.log(newUser)
    // return res.json({out:newScream})


    // todo validation

    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data=>{
            console.log(data)
            return res.status(201).json({message:`User ${data.user.uid} created successfully`})
        })
        .catch(err=>{
            console.log(err)
            return res.status(500).json({error: err})
        })

})  

// exports.createScream = functions.https.onRequest((req,res)=>{
app.post('/scream',(req,res)=>{
    
    
    // if (req.method !== 'POST')
    // {
    //     return res.status(400).json({error: "Method not allowed."})
    // }
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    }

    admin.firestore()
    .collection('screams')
    .add(newScream)
    .then(doc=>{
        return res.json({message: `document ${doc.id} created successfully`})
        
    })
    .catch(err=>{
        res.status(500).json({error:"Something went wrong: " + err})
        console.log(err)
    })
})

// api.post('/signup',(req,res)=>{
//     const newUser = {
//         email:req.body.email,
//         password:req.body.password,
//         confirmPassword: req.body.confirmPassword,
//         handle: req.body.handle,
//     }
// console.log(newUser)
// console.log(req.body)

// todo validation

    // firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    //     .then(data=>{
    //         return res.status(201).json({message:`User ${data.user.id} created successfully`})
    //     })
    //     .catch(err=>{
    //         console.log(err)
    //         return res.status(500).json({error: err})
    //     })
// })

exports.api = functions.https.onRequest(app)