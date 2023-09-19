const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const dotenv = require("dotenv").config();
const mongoClient = mongodb.MongoClient;
const URL = process.env.DB;
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const rn = require('random-number');


const options = {
    min: 1000,
    max: 9999,
    integer: true
}
const secret = process.env.SECRET;
app.use(express.json());
app.use(cors({
    origin: "https://tourmaline-longma-50f3a6.netlify.app"
}))



const authorize = (req, res, next) => {
    if (req.headers.authorization) {
        try {
            const verify = jwt.verify(req.headers.authorization, secret);
            if (verify) {
                next();
            }
        } catch (error) {
            res.status(401).json({ message: "Unauthorized" });
        }
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
}

//for registration
app.post('/register', async (req, res) => {

    try {

        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        const collection = db.collection("crmtask")
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        const operations = await collection.insertOne({ ...req.body, isDeleted: false })
        await connection.close();
        res.json({ message: "customer created" })
    } catch (error) {
        console.log('customer error')
    }

})

//Add users
app.post('/adduser', authorize, async (req, res) => {

    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        await db.collection('crmtask').insertOne(req.body);
        connection.close();
        res.json({ message: "User created" })
    } catch (error) {
        console.log('error')
    }

})

//to get register user detail
app.get('/userlist', authorize, async function (req, res) {

    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let users = await db.collection("crmtask").find({}).toArray();
        res.json(users);
        res.json({ message: "success" })
        await connection.close()


    } catch (error) {
        console.log('userlist error')
    }

})


//for login
app.post('/login', async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        const collection = db.collection("crmtask");
        const user = await collection.findOne({ email: req.body.email });

        if (user) {
            let passwordResult = await bcrypt.compare(req.body.password, user.password);
            if (passwordResult) {
                const token = jwt.sign({ userid: user._id }, secret, { expiresIn: '1h' })
                console.log(token)
                console.log(user)
                res.json({ message: "Login Success", token, user })

            }
            else {
                res.status.apply(401).json({ message: "Email id or password do not match" })
            }
        } else {
            res.status(401).json({ message: "Email id or password donot match" });
        }
    } catch (error) {
        console.log(error)
    }
})


// to get particular user
app.get('/user/:id', authorize, async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let objId = mongodb.ObjectId(req.params.id)
        let users = await db.collection("crmtask").findOne({ _id: objId });
        res.json(users);
        await connection.close()
    } catch (error) {
        console.log('User Not Found')
    }
})

app.get('/Userdata/:id', authorize, async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let objId = mongodb.ObjectId(req.params.id)
        let users = await db.collection("crmtask").findOne({ _id: objId });
        res.json(users);
        await connection.close()

    } catch (error) {
        console.log('User Not Found')
    }
})


//To edit particular user
app.put('/users/:id', authorize,
    async function (req, res) {
        try {
            let connection = await mongoClient.connect(URL);
            let db = connection.db('crm');
            let objId = mongodb.ObjectId(req.params.id);

            let user = await db.collection('crmtask').findOneAndUpdate({ _id: objId }, { $set: req.body });
            res.json({ message: 'user updated' }
            )

        } catch (error) {
            console.log('user update error')
        }
    })

//to delete user
app.delete('/user/:id', authorize, async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("crmtask").deleteOne({ _id: objId })
        await connection.close();
        res.json({ message: "user deleted" });
    } catch (error) {
        console.log('error')
    }
})


//add Lead
app.post('/contact', authorize, async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        await db.collection('contact').insertOne(req.body);
        connection.close();
        res.json({ message: "contact created" })
    } catch (error) {
        console.log('contact error')
    }


})


//View Lead
app.get('/lead', authorize, async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let users = await db.collection("contact").find({}).toArray();
        res.json(users);
        await connection.close()
    } catch (error) {
        console.log('contactlist error')
    }
})

//to delete lead
app.delete('/leads/:id', authorize, async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("contact").deleteOne({ _id: objId })
        await connection.close();
        res.json({ message: "Lead deleted" });
    } catch (error) {
        console.log('error')
    }
})
//View Particular Lead details
app.get('/leaddetails/:id', authorize, async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let objId = mongodb.ObjectId(req.params.id)
        let users = await db.collection("contact").findOne({ _id: objId });
        res.json(users);
        await connection.close()
    } catch (error) {
        console.log('User Not Found')
    }
})


//Edit Particular lead details
app.put('/editlead/:id', authorize,
    async function (req, res) {
        try {
            let connection = await mongoClient.connect(URL);
            let db = connection.db('crm');
            let objId = mongodb.ObjectId(req.params.id);

            let user = await db.collection('contact').findOneAndUpdate({ _id: objId }, {
                $set:
                {
                    fname: req.body.fname,
                    email: req.body.email,
                    company: req.body.company,
                    status: req.body.status
                }

            });
            res.json({ message: 'user updated' }
            )

        } catch (error) {
            console.log(error)
        }
    })


//service request 
app.post('/rservice', authorize, async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        await db.collection('service').insertOne(req.body);
        connection.close();
        res.json({ message: "service requested" })
    } catch (error) {
        console.log('service request error')
    }


})

//view service request
app.get('/service', authorize, async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let users = await db.collection("service").find({}).toArray();
        res.json(users);
        await connection.close()
    } catch (error) {
        console.log('servicelist error')
    }
})

//to delete service request
app.delete('/srequest/:id', authorize, async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("service").deleteOne({ _id: objId })
        await connection.close();
        res.json({ message: "Service deleted" });
    } catch (error) {
        console.log('error')
    }
})
//view particular service request
app.get('/servicedetails/:id', authorize, async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let objId = mongodb.ObjectId(req.params.id)
        let users = await db.collection("service").findOne({ _id: objId });
        res.json(users);
        await connection.close()
    } catch (error) {
        console.log('User Not Found')
    }
})


//Edit Particular Service Request
app.put('/editservice/:id', authorize,
    async function (req, res) {
        try {
            let connection = await mongoClient.connect(URL);
            let db = connection.db('crm');
            let objId = mongodb.ObjectId(req.params.id);

            let user = await db.collection('service').findOneAndUpdate({ _id: objId }, {
                $set:
                {
                    service: req.body.service,
                    details: req.body.details,
                    company: req.body.company,
                    status: req.body.status,
                    rdate: req.body.rdate,
                    sdate: req.body.sdate,
                }

            });
            res.json({ message: 'user updated' }
            )

        } catch (error) {
            console.log(error)
        }
    })


//forgot password
app.post('/mail', async function (req, res) {

    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let user = await db.collection("crmtask").findOne({ email: req.body.email });
        res.json(user)
        if (user) {
            let randomnum = rn(options)
            await db.collection('crmtask').updateOne({ email: req.body.email }, { $set: { rnum: randomnum } });
            var sender = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                secure: false,
                auth: {
                    user: 'sandhyadevi0229@gmail.com',
                    pass: 'guurmubpamqfohmf'
                }
            });

            var composemail = {
                from: "sandhyadevi0229@gmail.com",
                to: `${req.body.email}`,
                subject: 'send mail using node js',
                text: `${randomnum}`,


            };



            sender.sendMail(composemail, function (error, info) {
                if (error) {
                    console.log(error);
                    res.json({
                        message: "Error"
                    })
                } else {
                    console.log('Email sent: ' + info.response);
                    res.json({
                        message: "Email sent"
                    })
                }
            });
        }
        else {
            res.status(400).json({ message: 'User not found' })
        }
    }
    catch (err) {
        console.log(err)
    }


})

//verification
app.post('/verification/:id', async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('crm');
        let objId = mongodb.ObjectId(req.params.id)
        let user = await db.collection('crmtask').findOne({ _id: objId });
        if (user.rnum == req.body.vercode) {
            res.status(200).json(user)
        }
        else {
            res.status(400).json({ message: "Invalid Verification Code" })
        }
    }
    catch (error) {
        console.log('error')
    }
})


//Update Password
app.post('/ChangePassword/:id', async function (req, res) {
    try {

        const connection = await mongoClient.connect(URL);
        const db = connection.db('crm');
        let objId = mongodb.ObjectId(req.params.id)
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password1, salt);
        req.body.password1 = hash;
        let user = await db.collection('crmtask').findOneAndUpdate({ _id: objId }, { $set: { "password": req.body.password1 } })
        db.collection('crmtask').findOneAndUpdate({ _id: objId }, { $unset: { "rnum": 1 } }, false, true);
        db.collection('crmtask').findOneAndUpdate({ _id: objId }, { $unset: { "password1": 1 } }, false, true);
        let users = db.collection('crmtask').findOneAndUpdate({ _id: objId }, { $unset: { "password2": 1 } }, false, true);
        await connection.close();
        res.json({ message: "Password updated successfully" })
    } catch (error) {
        console.log(error);
    }
})


//app.listen(8000)
app.listen(process.env.PORT || 8000);