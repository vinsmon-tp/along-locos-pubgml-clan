const {Schema, model} = require('mongoose')
const vldr = require('validator')
const bcrypt = require('bcryptjs')

const locosSchema = new Schema({
    name :{
        type: String,
        required : true,
        trim : true,
        unique : true,
    },
    email : {
        type : String,
        unique : true,
        required : true,
        trim : true,
        lowercase : true,
        validate(value){
            if (! vldr.isEmail(value)){
                throw new Error('Email provided is not valid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    kd : {
        type : Number,
        required : true
    },
    player_desc : {
        type: String,
        required : false,
        default : "Locs memeber means legend on planet",
        trim : true
    },
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

locosSchema.methods.toJSON = function () {
    const locos = this
    const locosObject = locos.toObject()

    delete locosObject.password
    delete locosObject.email
    delete locosObject.createdAt
    delete locosObject.updatedAt
    delete locosObject.__v
    
    return locosObject
}

locosSchema.pre('save', async function (next) {
    const locos = this
    if (locos.isModified('password')) {
        locos.password = await bcrypt.hash(locos.password, parseInt(process.env.ENCODE))
    }
    next()
})

locosSchema.statics.findByCredentials = async (email, password) => {
    const loco = await Locos.findOne({ email })
    if (!loco) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, loco.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return loco
}

const Locos = model('Locos', locosSchema)

module.exports = Locos