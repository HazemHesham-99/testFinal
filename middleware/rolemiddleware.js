

function roleMiddleware(...roles){
    return (req,res,next)=>{
        const userRole = req.user.role

        if(!userRole){
            res.status(401).json({message:"unauthorized"})
        }

        const isExist =roles.includes(userRole)
        if(!isExist){
                        res.status(403).json({message:"access denied"})

        }
        next()
    }
}

module.exports={roleMiddleware}