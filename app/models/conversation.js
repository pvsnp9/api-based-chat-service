import mongoose,{Schema} from 'mongoose';

const conversationSchema = new Schema({
    author: {type:String, required:true},
    room: { type: Schema.Types.ObjectId, ref:'Room' },
    message: {type:String, required:true},
    seenBy:[String],
    isActive: {type: Boolean, default:true },
    isDeleted: {type:Boolean, default:false}
},{ timestamps: {}});

module.exports = mongoose.model('Conversation', conversationSchema);