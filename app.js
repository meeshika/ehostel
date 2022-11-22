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
const Complaint = require('./models/Complaint.js')
const bodyParser = require("body-parser");

//const flash = require('connect-flash');

const port = process.env.PORT || 3000;


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
  
  
const { 
  intializePassport , 
  isAuthenticated 
   
 //, checkAuthenticated ,
  // checkNotAuthenticated
  } = require("./passport-config.js")
const { userInfo } = require('os')
intializePassport(passport);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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


app.use(passport.initialize())
app.use(passport.session())
//app.use(methodOverride('_method'))


// app.get('/dashboard',(req,res)=>{
//     res.render('dashboard.ejs')
//   })
      
app.get('/register', (req, res) => {
  res.render('register.ejs')
})
      
app.post('/register', 
  //checkNotAuthenticated, 
  async (req, res) => {
    const {name,password,role,eid,email,hostel} = req.body;
    console.log(req.body.name);
    console.log(email);
    console.log(role);
    console.log(hostel);
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const newuser = new User({
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password,
        //password: hashedPassword,
        eid: eid,
        role:role,
        hostel:hostel
        });
          newuser.save().then(user =>{
            req.flash('success_msg', 'You are now registered and can log in');
            res.redirect('/login');
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
        
app.get('/login',(req,res)=>{
    res.render('login.ejs');
})
// app.post('/login',passport.authenticate('local',{
//     // failureRedirect:"/login",
//     // successRedirect:"/register",
//     // failureFlash: true
//   }),async(req,res) =>{
//     console.log(req.user);
//     res.render("dashboard.ejs")
// })

// app.post('/login',
//   passport.authenticate('local'),
//   function(req,res){
//     res.json(req.user);
//   }
// )

app.post('/login',passport.authenticate
('local',
  { 
    successRedirect: '/dashboard',
     failureRedirect: '/register' ,
  }
));

app.post('/dashboard',isAuthenticated,async(req,res)=>{
  var user1 = new User();
  user1  = req.user;
  console.log(user1);
  let objKeys = Object.keys(user1);
  let array =[];
  objKeys.forEach(key => {
      let value = user1[key];
      array.push(value);
  });
  console.log(array[0]);
  let uservalue = Object.values(array[0]);
  console.log(uservalue);
  console.log(uservalue[2]);
  const email = uservalue[2];
  const hostel = uservalue[6];
  console.log("==========complaints====");
  console.log(email);
  const user = await User.find({email});
  const{type,registeredby,slot,desc,room}=req.body;
  console.log(email);
  // var ctype ;
  // if( val == 1) ctype = "cleaning";
  // if( val == 2) ctype = "plumbing";
  // if( val == 3) ctype = ""
  try{
  const newComplaint = new Complaint({
    //type: ctype
    id: Date.now().toString(),
    //registeredby:user[0]['email'],
    registeredby:email,
    room:room,
    type:type,
    hostel:hostel,
    desc:desc,
    slot:slot,
    status:"pending"
    });
    newComplaint.save().then(Complaint =>{
      console.log("complaint registered");
      console.log(Complaint);
      res.redirect('/dashboard');
    }).catch(err => {
      console.log('new complaint didnt get saved in mongo')
      console.log(err)
     // res.redirect('/dashboard');
      
    })

  } catch(err){
    console.log(err);
  }
  })


app.get('/dashboard',
 //checkAuthenticated,
 isAuthenticated,
async(req,res)=>{
  console.log("========dashboard user ===============");
  
  var user = new User();
  user  = req.user;
  console.log(user);
  let objKeys = Object.keys(user);
  let array =[];
  objKeys.forEach(key => {
      let value = user[key];
      array.push(value);
  });
  let a = [...array];
  console.log("------------");
  console.log(array[0]);
  let uservalue = Object.values(array[0]);
  console.log(uservalue);
  console.log(uservalue[2]);
  const email = uservalue[2];
  const complaints = await Complaint.find({'registeredby':email});
  console.log(complaints);
  res.render('dashboard.ejs'
  ,{complaints:complaints}
  );
 // res.json({complaints});


  
  

}
)

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next){
  if (req.isAuthenticated()) {
    
    if (req.user[0]['role'] === 'student') {
      req.session.role = 'student';
     // req.session.email = req.user[0]['email']
    }

    if (req.user[0]['role'] === 'admin') {
      req.session.role = 'admin';
      req.session.email = req.user[0]['email']
    }
    return next()
  }
  req.flash('error_msg', "You're not authorized to view this resource")
  res.redirect('/login')
}


// function checkAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next()
//   }

//   res.redirect('/login')
// }

// function checkNotAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return res.redirect('/register')
//   }
//   next()
// }

//app.listen(3000)
app.listen(port,()=>{
  console.log("server is listening on port " + port)
})




