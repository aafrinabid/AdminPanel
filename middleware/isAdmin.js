function canViewUsers(user,next) {
   try{ return (
      user.role === 'admin'
    )
   }catch(error){
       next(error)
   }
  }

module.exports= canViewUsers