const { db, admin } = require('../util/admin')

exports.getAllScreams = (req,res) => {
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
}

exports.postOneScream =(req,res)=>{
    
    
    // if (req.method !== 'POST')
    // {
    //     return res.status(400).json({error: "Method not allowed."})
    // }
    if (req.body.body.trim()==='')
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
}