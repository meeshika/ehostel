if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const morgan = require("morgan");
const path = require('path');
const mongoose = require("mongoose");
const User = require('./models/User.js');
const bodyParser = require("body-parser");
//const flash = require('connect-flash');

const port = process.env.PORT || 3010;


mongoose.connect(
    "mongodb+srv://meeshika2:meeshika@cluster0.guftx.mongodb.net/hostel56?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },err => {
    if(err) throw err;
    console.log('Connected to MongoDB!!!')
    }
  );
  mongoose.Promise = global.Promise;

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  //secret: process.env.SESSION_SECRET,
  secret:"secret",
  resave: false,
  saveUninitialized: false
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', 
  //checkNotAuthenticated, 
  async (req, res) => {
  const {name,password,role,eid,email} = req.body;
  try {
    //const hashedPassword = await bcrypt.hash(password, 10)
    const newuser = new User({
      id: Date.now().toString(),
      name: name,
      email: email,
      password: password,
      // hashedPassword,
      eid: eid,
      role:role
  });
  newuser.save().then(user =>{
          req.flash('success_msg', 'You are now registered and can log in');
          res.redirect('/landing');
          console.log("user registerd");
          console.log(user);
      }).catch(err => {
        console.log('new user didnt get saved in mongo')
        console.log(err)

      })
    //newuser.save().then({
    //res.redirect('/landing')})
  } catch {
    res.redirect('/failed')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

//app.listen(3000)
app.listen(port,()=>{
  console.log("server is listening on port " + port)
})



// if(process.env.NODE_ENV !=='production'){
//   require('dotenv').config()
// }

// const express = require("express");
// const path = require('path');
// const morgan = require("morgan");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const flash = require('connect-flash');
// const bcrypt = require('bcrypt');
// const User = require('./models/User.js');
// const passport = require('passport');
// const session = require('express-session');

// const initializePassport = require('./passport-config')
// initializePassport(
//   passport,
//   email => User.find(user => user.email === email),
//   id => User.find(user => user.id == id)
// );


// const app = express();

// const port = process.env.PORT || 3000;

// // const userRoutes = require('./routes/user');
// // const { user_signup } = require("./controllers/user");


// app.set('view-engine', 'ejs');

// app.use(express.static(path.join(__dirname, 'public')));
// //app.use(express.static(__dirname + '/public'));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// mongoose.connect(
//   "mongodb+srv://meeshika2:meeshika@cluster0.guftx.mongodb.net/hostel3?retryWrites=true&w=majority",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   },err => {
//   if(err) throw err;
//   console.log('Connected to MongoDB!!!')
//   }
// );
// mongoose.Promise = global.Promise;

// app.use(morgan("dev"));

// app.use(flash());
// app.use(express.urlencoded({extended: false}))
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(session({
//   // secret : process.env.SESSION_SECRET,
//   secret : 'secret',
//   resave : false,
//   saveUninitialized : false
// }))
// app.use(passport.initialize())
// app.use(passport.session())
// //app.set('views', path.join(__dirname, 'views'));


  
// // Routes which should handle requests
// //app.use("/user", userRoutes);

// //landing page
// app.get("/",(req,res)=>{
//   console.log('landing page');
//   return res.status(200).json({message:"api connected succefully"})
// })

// app.get('/login',(req,res)=>{
//   res.render('login.ejs');
// })

// app.post('/login',passport.authenticate('local',{
//   successRedirect: '/',
//   failureRedirect: '/login',
//   failureFlash: true,
// }))

// app.get('/register',(req,res)=>{
//   res.render('register.ejs');
// });

// app.post('/register',(req,res)=>{
//   const{name, email,role,  password, eid} = req.body;
//   try{
//     //const hashPass = bcrpt.hash(req.body.password , 10)
//     const newUser = new User({
//       name,
//       email,
//       password,
//       eid
//   });
//   newUser.save().then(user =>{
//       req.flash('success_msg', 'You are now registered and can log in');
//       res.redirect('/login');
//       console.log("user registerd");
//       console.log(user);
//   })
//   .catch(err=> console.log(err));
//   }catch{
//     res.redirect('/register');
//     console.log("issues with registration");

//   }
// })



// app.use((req, res, next) => {
//   const error = new Error("Not found");
//   error.status = 400;
//   console.log(error);
//   next(error);
// });


// app.use((error, req, res, next) => {
//   res.status(error.status || 500);
//   res.json({
//     error: {
//       message: error.message
//     }
//   });
// });

// app.listen(port,()=>{
//     console.log("server is listening on port " + port)
// })

// module.exports = app;
