const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const passport = require('passport')

const User = require('./models/User.js')

exports.intializePassport  = (passport) => {
  passport.use(new LocalStrategy({
    usernameField:'email',
    passwordField:'password'
  },async(email,password,done)=>{
    try{
    console.log("intialize passport:")
   // console.log(email);
   // console.log(password);

    const user = await User.find({ email});
   // console.log(user);
  if(!user) return done(null,false,{message: 'Incorrect email'});
    //  console.log("user found");
    //  console.log(user[0]['password']);
    //  console.log(password);
  if(user[0]['password'] !== password ) return done(null,false,{message:'Incorrect password'});
  console.log("sahi user password");
  return done(null,{user},{message:"login succesful"});
  } catch (error){
    console.log("passport athentication failed")
    return done(error,false);
  }

  }))


passport.serializeUser((user,done)=>{
  console.log(user);
  //console.log(user[0]['_id']);
  done(null,user);
});

passport.deserializeUser(async(user,done)=>{
  try{
    //const user = await User.findById(_id);
    done(null,user);

  }catch(error){
    done(error , false);
  }
})
};

exports.isAuthenticated = ( req,res,next)=>{
  if(req.user) return next();
  res.redirect("/failed")
}

// function initialize(passport, getUserByEmail, getUserById) {
//   const authenticateUser = async (email, password, done) => {
//     const user = getUserByEmail(email)
//     if (user == null) {
//       return done(null, false, { message: 'No user with that email' })
//     }

//     try {
//       if (await bcrypt.compare(password, user.password)) {
//         return done(null, user)
//       } else {
//         return done(null, false, { message: 'Password incorrect' })
//       }
//     } catch (e) {
//       return done(e)
//     }
//   }

//   passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
//   passport.serializeUser((user, done) => done(null, user.id))
//   passport.deserializeUser((id, done) => {
//     return done(null, getUserById(id))
//   })
// }

// module.exports = initialize

// const passport = require('passport')
// const bcrypt = require('bcrypt')
// const { getUserById } = require('./models/User.js')
// const localStrategy = require('passport-local').Strategy

// function initialize(passport , getUserByEmail , getUserById){
//     const authenticateUser = async (email , pasword , done) =>{
//     const user = getUserByEmail(email) 
//     if(user == null) {
//         return done(null, false ,{message:'No user with that email'})
//         }
//         try {
//             if(await bcrypt.compare(password,user.password)){
//                 return done(null,user)
//             }else{
//                 return done(null , false , {message: 'Password incorrect'})
//             }
//         }catch(error){
//             return done(error)
//         }
//     }
//     passport.use( new localStrategy({usernameField:'email'},
//     authenticateUser))
//     passport.serializeUser((user,done) => done(null, user.id))
//     passport.deserializeUser((user,done) => {
//         return done(null,getUserById(id))
//     })
// }

// module.exports = initialize