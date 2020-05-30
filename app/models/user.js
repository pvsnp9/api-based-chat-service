import mongoose,{Schema} from 'mongoose';

const userSchema = new Schema({
    firstName: {type:String, required:true},
    lastName: {type:String, required:true},
    email: {type:String, required: true, unique:true },
    password: {type: String }
},{ timestamps: {}});

module.exports = mongoose.model('User', userSchema);