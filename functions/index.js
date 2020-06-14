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

const db = admin.firestore()


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


const isEmpty = (str) => {
    if (str.trim() === "" ) return true
    else return false

}

const isEmail = (email) => {

    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (regex.test(email) === true)
        return true
    else return false

}

app.post('/signup',(req,res)=>{


    // if (req.method !== 'POST')
    // {
    //     return res.status(400).json({error: "Method not allowed."})
    // }
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
        // createdAt: new Date().toISOString()
    }
    console.log(newUser)
    // return res.json({out:newScream})

    let errors = {}

    if (isEmpty(newUser.email)){
        errors.email = "Cannot be empty"
    }
    else if (isEmail(newUser.email)==false){
        errors.email = "Please enter valid email address"
    }

    // }

    if (isEmpty(newUser.password ))
    {
        errors.password = "Cannot be empty"
    }
    else if (newUser.password != newUser.confirmPassword) {
        errors.confirmPassword = "Passwords must match"

    }


    
    if (isEmpty(newUser.handle ))
    {
        errors.handle = "Cannot be empty"
    }
    if (errors!={})
    {
     return res.status(400).json(errors )   
    }

    let userId, token

    db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc=>{
        if (doc.exists){
            return res.status(400).json({handle:`${newUser.handle} is alreday tsaken.`})

        }
        else {
            return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email,newUser.password)
            

        }
    })
    .then(data=>{
        userId = data.user.uid


        return data.user.getIdToken()
    })
    .then(userToken=>{
        token = userToken

        return db.doc(`/users/${newUser.handle}`)
        .set({handle: newUser.handle,email: newUser.email, createdAt: new Date().toISOString(), userId })

        // return res.status(201).json({token})
    })
    .then(data=>{
        return res.status(201).json({token})
    })
    .catch(err=>{
        return res.status(500).json({err: err.code})
    })




    // todo validation

    // firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    //     .then(data=>{
    //         console.log(data)
    //         return res.status(201).json({message:`User ${data.user.uid} created successfully`})
    //     })
    //     .catch(err=>{
    //         console.log(err)
    //         return res.status(500).json({error: err})
    //     })

})  


app.post('/login',(req,res)=>{

    const user = {
        email: req.body.email,
        password: req.body.password
    }
    console.log('passed 1')

    let errors = {}

    if (isEmpty(user.email))
        errors.email = "Cannot be empty"
    else if (!isEmail(user.email)){
        errors.email = "Not valid"
    }

    if (isEmpty(user.password))
    {
        errors.password = "Cannot be empty"
    }
    
    console.log(errors,'errs abve')

    if (Object.keys(errors).length > 0)
    {
        console.log('in if')
        return res.status(400).json(errors )   

        // return res.status(400).json(errors)
    }
    console.log('passed here')
    firebase.auth().signInWithEmailAndPassword(user.email,user.password)
    .then(data=>{

        return data.user.getIdToken()
    })
    .then(idToken=>{
        return res.status(201).json({token: idToken})
    })
    .catch(err=>{
        console.log(err,'in catch earlier')
        if (err.code == 'auth/wrong-password')
        {
            // errors.password = 'password is wrong'
            return res.status(400).json({general: 'password is wrong' })
        }
        else return res.status(500).json({error:err.code})
    })
    

})

const FBAuth = (req, res, next) => {

    let idToken ;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer "))
    {
        idToken = req.headers.authorization.split('Bearer ')[1]

    }
    else {
        console.log('no token found')
        return res.status(403).json({error: "Unauthorized"})
    }

    admin.auth().verifyIdToken(idToken)
    .then(decodedToken=>{
        console.log('decoded tkn starts',decodedToken,'decoded token')
        console.log(decodedToken.uid)

        req.user = decodedToken

        return db.collection('users')
        .where('userId','==',req.user.uid)
        .limit(1)
        .get()
    })
    .then(data=>{
        console.log('in data',data,'in data abve')
        req.user.handle=data.docs[0].data().handle
        return next()

    })
    .catch(err=>{
        console.error("Error while verifying token: ",err)
        return res.status(403).json(err)
    })


}

// exports.createScream = functions.https.onRequest((req,res)=>{
app.post('/scream', FBAuth, (req,res)=>{
    
    
    // if (req.method !== 'POST')
    // {
    //     return res.status(400).json({error: "Method not allowed."})
    // }
    if (req.body.body.trim()=='')
    {
        return res.status(400).json({body: "Cannot be empty"})
    }

    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
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