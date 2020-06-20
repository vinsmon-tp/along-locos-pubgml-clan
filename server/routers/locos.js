const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const bcrypt = require('bcryptjs')
const Locos = require('../models/locos')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post(process.env.REGISTER_URL, async (req, res) => {
    const loco = new Locos(req.body)
    try {
        await loco.save()
        res.status(201).send(loco)
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const loco = await Locos.findByCredentials(email, password)
        req.session.userId = loco._id
        res.status(200).redirect('/user')
    } catch (e) {
        res.send(`<script> alert("Invalid credentials ${e.message}"); 
        window.location.href = "/"</script>`);
    }
})

const upload1 = multer({
    limits: {
        fileSize: 256000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|PNG|JPG|JPEG)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/upload', auth.redirectToMain, upload1.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    const {user} = res.locals
    user.avatar = buffer
    await user.save()
    res.locals.user = undefined
    res.locals.user = user
    return res.send(`<script> alert("Avatar updated"); 
                                window.location.href = "/user" </script>`);
}, (error, req, res, next) => {
    console.log(error)
    return res.send(`<script> alert("JPG PNG formats with maximum 256kb only supported"); 
                                window.location.href = "/user" </script>`);
})

router.post('/logout', auth.redirectToMain,(req, res) => {
    req.session.destroy(e => {
        if(e){
            return res.redirect('/home')
        }
        res.clearCookie(process.env.COOKIE_SID)
        res.redirect('/')
    })
})

router.post('/edit', auth.redirectToMain, async (req, res) => {
    const {user} = res.locals
    const reqUpdateKeys = Object.keys(req.body)
    const validKeys = ['name', 'email', 'password', 'kd', 'player_desc', 'oldpassword']
    const isValidUpdateReq = reqUpdateKeys.every(requestedKey => validKeys.includes(requestedKey))

    if(!isValidUpdateReq){
        return res.send(`<script> alert("Request failed! Contact Admin."); 
        window.location.href = "/user"</script>`);
    }
    try{
        if(reqUpdateKeys.includes('avatar')){
            
        }else if(reqUpdateKeys.includes('password')){
            const isMatch = await bcrypt.compare(req.body['oldpassword'], user.password)
            if(!isMatch){
                return res.send(`<script> alert("Old password didnt matched"); 
                                window.location.href = "/user" </script>`);
            }
            reqUpdateKeys.forEach(key => user[key] = req.body[key])
            res.locals.user = undefined
            res.locals.user = user
            await user.save()
            return res.send(`<script> alert("Password changed"); 
                                window.location.href = "/user" </script>`);
        }else{
            reqUpdateKeys.forEach(key => user[key] = req.body[key])
            res.locals.user = undefined
            res.locals.user = user
            await user.save()
            return res.send(`<script> alert("Update is done."); 
                                window.location.href = "/user" </script>`);
        }
    }catch(e){
        console.log(e)
        return res.send(`<script> alert("Request failed! Contact Admin."); 
        window.location.href = "/user"</script>`);
    }
})

module.exports = router