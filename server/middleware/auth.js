const redirectToMain = function(req, res, next){
    if(! req.session.userId){
        return res.redirect('/')
    }
    next()
}

const redirectToHome = function(req, res, next){
    if(req.session.userId){
        return res.redirect('/user')
    }
    next()
}
module.exports={redirectToMain, redirectToHome}