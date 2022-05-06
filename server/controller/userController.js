const User =require('../models/schema')
const jwt= require('jsonwebtoken')
const bcrypt=require('bcrypt')
const isAdmin=require('../../middleware/isAdmin')
const {roles}= require('../roles')
exports.grantAcces=function(action,resource){
    return async(req,res,next)=>{
        try{
            const permission =roles.can(req.user.role)[action](resource)
            if(!permission.granted){
                return res.status(401),json({
                    error:'naaah man you aint that guy'

                })
            }
            next()
        }catch(error){
            next(error)
        }
    }

}


exports.allowIfLoggedIn=async (req,res,next)=>{
    try{
        const user=res.locals.loggedInUser;
        if(!user) 
        return res.status(401).json({
            error:'go fuking login what you waiting for'

        })
        req.user = user;
   next();
  } catch (error) {
   next(error);
  }
}




async function hashPassword(password){
    return await bcrypt.hash(password,10)
}
async function validatePassword(plainPassword,hashedPassword){
    return await bcrypt.compare(plainPassword,hashedPassword)
}

exports.signup=async (req,res,next)=>{
    try{
        const {email,password,role}=req.body
        const hashPassword=await hashPassword(password);
        const newUser=new User({email,password:hashPassword,role:role || "basic"})
        const accessToken=jwt.sign({userId:newUser._id},process.env.JWT_SECRET,{
            expiresIn:'1d'
        })
        newUser.accessToken=accessToken;
        await newUser.save()
        res.json({
            data:newUser,
            accessToken
        })
    }catch(error){
        next(error)
    }
}


exports.login = async (req, res, next) => {
    try {
     const { email, password } = req.body;
     const user = await User.findOne({ email });
     if (!user) return next(new Error('Email does not exist'));
     const validPassword = await validatePassword(password, user.password);
     if (!validPassword) return next(new Error('Password is not correct'))
     const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
     });
     await User.findByIdAndUpdate(user._id, { accessToken })
     res.status(200).json({
      data: { email: user.email, role: user.role },
      accessToken
     })
    } catch (error) {
     next(error);
    }
   }


   exports.getUsers=isAdmin,async(req,res,next)=>{
       const users=await User.find({})
       res.statu(200).json({
           data:users
       })
   }

   exports.getUser = async (req, res, next) => {
    try {
     const userId = req.params.userId;
     const user = await User.findById(userId);
     if (!user) return next(new Error('User does not exist'));
      res.status(200).json({
      data: user
     });
    } catch (error) {
     next(error)
    }
   }

   exports.updateUser=async (req,user,next)=>{
       try{
           const update=req.body
           const {userId}=req.params
           await User.findByIdAndUpdate(userId,update)
           const user= await User.findById(userId)
           res.status(200).json({
               data:user,
               message:'user has been updated'
           })

       }catch(error){
           next(error)
       }
   }

   exports.deleteUser=async (req,res,next)=>{
       try{
           const {userId}=req.params
           await User.findByIdAndDelete(userId)
           res.status(200).json({
               data:null,
               message:'user has been deleted'
           })
       }catch(error){
           next(error)
       }
   }