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
  
  
const { intializePassport , isAuthenticated} = require("./passport-config.js")
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

app.post('/login',
 passport.authenticate('local',
  { 
    successRedirect: '/dashboard',
     failureRedirect: '/register' ,
  }));

app.post('/dashboard',(req,res)=>{
  const{type,registeredby,slot,hostel,desc,val}=req.body;
  console.log(val);
  // var ctype ;
  // if( val == 1) ctype = "cleaning";
  // if( val == 2) ctype = "plumbing";
  // if( val == 3) ctype = ""
  try{
  const newComplaint = new Complaint({
    //type:
    id: Date.now().toString(),
    registeredby:registeredby,
    slot:slot,
    hostel:hostel,
    desc:desc
    });
    newComplaint.save().then(Complaint =>{
      console.log("complaint registered");
      console.log(Complaint);
    }).catch(err => {
      console.log('new complaint didnt get saved in mongo')
      console.log(err)
      
    })
  } catch(err){
    console.log(err);
  }
  })


app.get('/dashboard', isAuthenticated,
async(req,res)=>{
  //res.send(user);
  const{email} = req.body;
  const complaints = await Complaint.find({email});
  console.log(complaints);
  res.render('dashboard.ejs'
  ,{complaints}
  );
  //res.json({complaints});


  
  

}
)

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/dashboard')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/register')
  }
  next()
}

//app.listen(3000)
app.listen(port,()=>{
  console.log("server is listening on port " + port)
})




