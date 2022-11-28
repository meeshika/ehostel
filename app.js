if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
//const session = require('express-session')
const methodOverride = require('method-override')
const morgan = require("morgan");
const path = require('path');
const mongoose = require("mongoose");
const User = require('./models/User.js');
const Complaint = require('./models/Complaint.js')
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
var nodemailer = require('nodemailer');



//const flash = require('connect-flash');

const port = process.env.PORT || 3001;


mongoose.connect(
  "mongodb+srv://meeshika2:meeshika@cluster0.guftx.mongodb.net/hostelfinal?retryWrites=true&w=majority",
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
  intializePassport , isAuthenticated 
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

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mgarg2_be20@thapar.edu',
    pass: 'Meeshika@06'
  }
});
// app.use(
//   session({
//     genid: (req) => {
//       console.log("1. in genid req.sessionID: ", req.sessionID);
//       return uuidv4();
//     },
//     // where we store the session data. Normally a Database like MongoDB or PostGreSQL
//     // session-file-store package defaults to ./sessions
//     store: new FileStore(),
//     // think of the secret as a "missing puzzle piece".
//     secret: "a private key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

app.use(passport.initialize())
app.use(passport.session())
//app.use(methodOverride('_method'))


// app.get('/dashboard',(req,res)=>{
//     res.render('dashboard.ejs')
//   })

// app.get('/landing',(res,req)=>{
//   res.render('landing.ejs')
// })
app.post('/connect' , (req,res)=>{
  console.log("emial connect")
  console.log(req.body.email)
  var mailOptions = {
    from: 'mgarg2_be20@thapar.edu',
    to: req.body.email,
    subject: 'HOSTILIFY',
    text: `Hi , thanks for connecting to hostilfy .`
    // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'        
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.redirect('/')
})
app.get('/landing', (req, res) => {
  res.render('register.ejs')
})

app.get('/register', (req, res) => {
  res.render('register.ejs')
})
      
app.post('/register', 
  //checkNotAuthenticated, 
  async (req, res) => {
    const {name,password,role,eid,email,hostel} = req.body;
    // console.log(req.body.name);
    // console.log(email);
    // console.log(role);
    // console.log(hostel);
    // if(User.find({email})){
    //   console.log("not a unique email id");
    //   res.redirect('/register');
    // }
    // if(password.length < 8){
    //   console.log("password is too short");
    //   res.redirect('./register');
    // }
    const errors = validateRegisterInput(req.body)
    console.log("back in register")
    console.log(Object.keys(errors).length)
    if(Object.keys(errors).length > 0 ) {
      console.log(errors);
      return res.redirect('/register')
    }
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
    
// app.get('/',(req,res)=>{
//   res.render('landing.ejs');
// })
app.get('/login',(req,res)=>{
    res.render('login.ejs');
})
app.get('/',(req,res)=>{
  res.render('home.ejs');
})
app.post('/',(req,res)=>{
  res.redirect('/login');
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

app.get('/admin' ,
isAuthenticated,
async(req,res)=>{
  var user = new User();
  user  = req.user;
  console.log(user);
  let objKeys = Object.keys(user);
  let array =[];
  objKeys.forEach(key => {
      let value = user[key];
      array.push(value);
  });
  console.log("------------");
  console.log(array[0]);
  let uservalue = Object.values(array[0]);
  console.log(uservalue);
  console.log(uservalue[2]);
  const email = uservalue[2];
  const hostel = uservalue[6];
  const complaints = await Complaint.find({'hostel':hostel});
  console.log(complaints);


  res.render('admin.ejs',{complaints:complaints})
})

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
  const{type,slot,desc,room}=req.body;
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


app.get('/dashboard', isAuthenticated, async(req,res)=>{
  console.log("========dashboard user ===============");
  
  var user = new User();
  user  = req.user;
  //console.log(user);
  let objKeys = Object.keys(user);
  let array =[];
  objKeys.forEach(key => {
      let value = user[key];
      array.push(value);
  });
 // console.log("------------");
 // console.log(array[0]);
  let uservalue = Object.values(array[0]);
  //console.log(uservalue);
  //console.log(uservalue[2]);
  console.log("++++++++++++++++++++++++++++")
  const email = uservalue[2];
  const role = uservalue[5];
  const hostel = uservalue[6];
  console.log(role);
  let complaints;
  let complaints_handled;
  let complaints_pending;
  let complaints_total;
  if(role == 'student')
  { 
    console.log("student logged in ===============================");
    complaints = await Complaint.find({'registeredby':email});
    complaints_handled = await Complaint.find({'registeredby':email,'status':"handled"}).count();
    complaints_pending = await Complaint.find({'registeredby':email,'status':"pending"}).count();
    complaints_total = await Complaint.find({'registeredby':email}).count();
    res.render('dashboard.ejs',{complaints:complaints , complaints_handled , complaints_pending , complaints_total});
  }
  if( role == 'admin')
  { 
    console.log("admin logged in ==================================");
    complaints = await Complaint.find({'hostel':hostel});
    complaints_handled = await Complaint.find({'hostel':hostel,'status':"handled"}).count();
    complaints_pending = await Complaint.find({'hostel':hostel,'status':"pending"}).count();
    complaints_total = await Complaint.find({'hostel':hostel}).count();
    console.log(complaints_total);
    res.render('admin.ejs',{complaints:complaints , ch:complaints_handled , cp:complaints_pending , ct:complaints_total});
  }
  //console.log(complaints);
  // res.render('dashboard.ejs'
  // ,{complaints:complaints}
  // );
 // res.json({complaints});


  
  

}
)

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function containsAnycap(str) {
  return /[A-Z]/.test(str);
}
function containsAnynum(str) {
  return /[0-9]/.test(str);
}
function containsrate(str) {
  return /[0-9]/.test(str);
}

function validateRegisterInput (data){
  let errors = {}
  console.log("000000000000000000000000000000000000")
  //console.log(data.name.length)
  if(data.name.length< 2) {
    errors.name = 'Name should be between 2 and 30 characters'
  }
  if(data.password.length < 8 || data.password.length > 30) {
    errors.password = 'password should be between 8 and 30 characters'
  }
  if(data.eid.length < 8 || data.eid.length > 10) {
    errors.eid = 'eid should be between 8 and 10 characters'
  }
  if(!containsAnycap(data.password)){
    errors.password = 'password should contain atleast 1 capital letter'
  }
  if(!containsAnynum(data.password)){
    errors.password = 'password should contain atleast 1 number'
  }
  if(!containsrate(data.email) && data.email.split(/@/)[1] != 'thapar.edu' ){
    errors.password = 'email should be like @thapar.edu'
  }
  console.log("validated user data")
  console.log(errors);
  return errors;
  // if(data.email.split(/@/)[1] != 'thapar.edu'){
  //   errors.email = 'register using Thapar email id'
  // }
  // data.username = !isEmpty(data.username) ? data.username : ''
  // data.password = !isEmpty(data.password) ? data.password : ''
  // if (!validator.isLength(data.username, {
  //         min: 2,
  //         max: 30
  //     })) {
  //     errors.username = 'Username should be between 2 and 30 characters'
  // }
  // if (validator.isEmpty(data.username)) {
  //     errors.username = 'Username is required'
  // }
  // if (validator.isEmpty(data.password)) {
  //     errors.password = 'Password is required'
  // }
  // if (!validator.isLength(data.password, {
  //         min: 6,
  //         max: 30
  //     })) {
  //     errors.password = 'Password should be at least 6 characters'
  // }
  // return {
  //     errors,
  //     isValid: isEmpty(errors)
  // }
}

// function checkAuthenticated(req, res, next){
//   if (req.isAuthenticated()) {
    
//     if (req.user[0]['role'] === 'student') {
//       req.session.role = 'student';
//      // req.session.email = req.user[0]['email']
//     }

//     if (req.user[0]['role'] === 'admin') {
//       req.session.role = 'admin';
//       req.session.email = req.user[0]['email']
//     }
//     return next()
//   }
//   req.flash('error_msg', "You're not authorized to view this resource")
//   res.redirect('/login')
// }


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



