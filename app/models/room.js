import mongoose,{Schema} from 'mongoose';

const roomSchema = new Schema({
    room: {type:String},
    participants: [String],
    isActive: {type:Boolean, default:true},
    isDeleted: {type:Boolean, default: false }
},{ timestamps: {}});

roomSchema.virtual('conversations', {
    ref:'Conversation',
    localField: '_id',
    foreignField: 'room'
});

module.exports = mongoose.model('Room', roomSchema);