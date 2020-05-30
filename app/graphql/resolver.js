import Models from '../models'
import Validator from 'validator';
import { isUndefined } from 'util';

module.exports = {
    createRoom: async({ room, Participants }, req) => {
        const errors = [];
        if(Validator.isEmpty(Participants)) errors.push({message:"No Participants"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }

        let parsedParticipants = Participants.split(",");
        parsedParticipants.sort();

        const Room = new Models.Room({
            room: !(Validator.isEmpty(room)) ? room : "",
            participants: parsedParticipants
        });
        let newRoom = await Room.save();

        return {_id:newRoom._id.toString(), room: newRoom.room, participants:newRoom.participants, isActive:newRoom.isActive, isDeleted:newRoom.isDeleted, createdAt:newRoom.createdAt, updatedAt:newRoom.updatedAt};
    },

    createConversation: async ({conversation}, req) => { 
        const errors = [];
        if(Validator.isEmpty(conversation.author)) errors.push({message:"author is empty"});
        if(Validator.isEmpty(conversation.room)) errors.push({message:"No room has been specified"});
        if(Validator.isEmpty(conversation.message)) errors.push({message:"conversation has no content"});

        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }

        //validate particpants 
        const room = await Models.Room.findById(conversation.room);
        if(!room.participants.includes(conversation.author)) throw new Error("Author does not belongs to this room");

        const Conversation = new Models.Conversation({
            author:conversation.author,
            room:conversation.room,
            message: conversation.message
        });

        const newConversation = await Conversation.save();
        return {
            _id:newConversation._id.toString(),
            author: newConversation.author,
            message: newConversation.message,
            isActive: newConversation.isActive,
            isDeleted: newConversation.isDeleted,
            createdAt: newConversation.createdAt,
            updatedAt: newConversation.updatedAt
        }
    },

    removeConversation: async ({conversationId}, req) => {
        const errors = [];
        if(Validator.isEmpty(conversationId)) errors.push({message:"Conversation ID is empty"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }
        let Conversation = await Models.Conversation.findByIdAndUpdate(conversationId, {isActive:false, isDeleted:true}, {new:true});
            if(Conversation){
                return {_id:Conversation._id.toString(), message:"conversation successfully removed"};
            }else {
                throw new Error("Error Occurred");
            }
    },

    removeRoom: async ({roomId}, req) => {
        const errors = [];
        if(Validator.isEmpty(roomId)) errors.push({message:"Room ID is empty"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }

        let Room = await Models.Room.findByIdAndUpdate(roomId, {isActive:false, isDeleted:true}, {new:true});
            if(Room){
                return {_id:Room._id.toString(), message:"Room successfully removed"};
            }else {
                throw new Error("Error Occurred");
            }
    },

    updateParticipants: async({roomId, Participant, command}, req) => {
        const errors = [];
        if(Validator.isEmpty(roomId)) errors.push({message:"Conversation ID is empty"});
        if(Validator.isEmpty(Participant)) errors.push({message:"participant is empty"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }
        const existingRoom = await Models.Room.findById(roomId);
        if(existingRoom){
            if(command==="add"){
                if(existingRoom.participants.includes(Participant)) throw new Error("User already added");
            }
            if(command==="remove"){
                if(!existingRoom.participants.includes(Participant)) throw new Error("User does not belongs to this chat");
            }
        }
        let newRoom;
        if(command ==="add"){
            newRoom = await Models.Room.findByIdAndUpdate(roomId, {$push:{participants:Participant}}, {new:true});
            newRoom.participants = newRoom.participants.sort();
            await newRoom.save();
        }else if(command ==="remove"){
            newRoom = await Models.Room.findByIdAndUpdate(roomId, {$pull:{participants:Participant}}, {new:true});
            newRoom.participants = newRoom.participants.sort();
            await newRoom.save();
        }else{
            throw new Error("Command undefined !!");
        }

        if(newRoom){
            return {_id:newRoom._id.toString(), room: newRoom.room, participants:newRoom.participants, isActive:newRoom.isActive, isDeleted:newRoom.isDeleted, createdAt:newRoom.createdAt, updatedAt:newRoom.updatedAt};
        }else {
            throw new Error("Error Occurred");
        }
    },

    fetchRooms: async() => {
        let allData =[];
        const rooms = await Models.Room.find({isActive:true, isDeleted:false})
                            .sort({'updatedAt':-1})
                            .limit(20);
        if(rooms){
            rooms.map(data => {
                allData.push({_id:data._id.toString(), room: data.room, participants:data.participants, isActive:data.isActive, isDeleted:data.isDeleted, createdAt:data.createdAt, updatedAt:data.updatedAt});
            });
            return {room: allData};
        }else {
            throw new Error("No Data found");
        }
    },

    fetchRoom: async({roomId}, req) => {
        const errors = [];
        if(Validator.isEmpty(roomId)) errors.push({message:"Room ID is empty"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }
        const room = await Models.Room.findOne({_id:roomId, isActive:true, isDeleted:false});
        if(room){
            return {_id:room._id.toString(), room: room.room, participants:room.participants, isActive:room.isActive, isDeleted:room.isDeleted, createdAt:room.createdAt, updatedAt:room.updatedAt};

        }else{
            throw new Error("No record found");
        }
    },

    fetchChat: async({roomId}, req) => {
        const errors = [];
        if(Validator.isEmpty(roomId)) errors.push({message:"Room ID is empty"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }

        const chat = await Models.Room.findOne({_id:roomId, isActive:true, isDeleted:false})
                                .select('-__v')
                                .populate({
                                    path:'conversations',
                                    match:{isActive:true, isDeleted:false},
                                    select:'-__v'
                                });
        let data =[];
        chat.conversations.map(conversation => {
            data.push({
                _id:conversation._id.toString(),
                author: conversation.author,
                message: conversation.message,
                isActive: conversation.isActive,
                isDeleted: conversation.isDeleted,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            })
        });

        return {_id:chat._id.toString(), room: chat.room, participants:chat.participants, isActive:chat.isActive, isDeleted:chat.isDeleted, createdAt:chat.createdAt, updatedAt:chat.updatedAt, conversations: data};
    },

    fetchParticipants: async({roomId}, req) =>{
        const errors = [];
        if(Validator.isEmpty(roomId)) errors.push({message:"Room ID is empty"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }

        let room = await Models.Room.findOne({_id:roomId, isActive:true, isDeleted:false})
                        .select('-__v');
        if(!room) throw new Error("Room does not exist");
        return {participants: room.participants};
    },
    fetchAllMyChats: async({participantId}, req) => {
        const errors = [];
        if(Validator.isEmpty(participantId)) errors.push({message:"Participant ID is empty"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }
        const myChat = await Models.Room.find({isActive:true, isDeleted:false,participants:participantId})
                                        .select('-__v')
                                        .populate({
                                            path:'conversations',
                                            match:{isActive:true, isDeleted:false},
                                            select:'-__v'
                                        });
        if(isUndefined(myChat)){
            throw new Error("No record found");
        }
        let data =[];
        myChat.conversations.map(conversation => {
            data.push({
                _id:conversation._id.toString(),
                author: conversation.author,
                message: conversation.message,
                isActive: conversation.isActive,
                isDeleted: conversation.isDeleted,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            })
        });

        return {_id:myChat._id.toString(), room: myChat.room, participants:myChat.participants, isActive:myChat.isActive, isDeleted:myChat.isDeleted, createdAt:myChat.createdAt, updatedAt:myChat.updatedAt, conversations: data};
    },

    //fetch all users room
    fetchMyRooms: async({participantId}, req) => {
        const errors = [];
        if(Validator.isEmpty(participantId)) errors.push({message:"Participant ID is empty"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }
        const rooms = await Models.Room.find({participants:participantId, isActive:true, isDeleted:false})
                                       .select('-__v')
                                       .sort({'updatedAt':-1});

        if(rooms.length > 0){
            let data = [];
            rooms.map(room => {
                data.push({
                    _id:room._id.toString(), 
                    room: room.room, 
                    participants:room.participants, 
                    isActive:room.isActive, 
                    isDeleted:room.isDeleted, 
                    createdAt:room.createdAt, 
                    updatedAt:room.updatedAt
                });
            });
            return {room:data};
        }else{
            throw new Error("No room has been joined by the participant");
        }
    },
    //fetch group of a user
    fetchMyGroup: async({participantId}, req) => {
        const errors = [];
        if(Validator.isEmpty(participantId)) errors.push({message:"Participant ID is empty"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }

        const rooms = await Models.Room.find({participants:participantId, isActive:true, isDeleted:false})
                                       .select('-__v')
                                       .sort({'updatedAt':-1});
        let data = [];
        if(rooms.length > 0){
            rooms.map(room =>{
                if(room.participants.length > 2){
                    data.push({
                        _id:room._id.toString(), 
                        room: room.room, 
                        participants:room.participants, 
                        isActive:room.isActive, 
                        isDeleted:room.isDeleted, 
                        createdAt:room.createdAt, 
                        updatedAt:room.updatedAt
                    });
                }
            });
            return {groups:data};
        }else {
            throw new Error("no rooms found of this user")
        }
    },
    //just a spare function to launch room
    anotherLaunchRoom: async({room, Participants}, req) => {
        if(Validator.isEmpty(room) && !Validator.isEmpty(Participants)){
            let parsedParticipants = Participants.split(",");
            const Room = new Models.Room({
                room: !(Validator.isEmpty(room)) ? room : "",
                participants: parsedParticipants
            });
            const newRoom = await Room.save();
            return {_id:newRoom._id.toString(), room: newRoom.room, participants:newRoom.participants, isActive:newRoom.isActive, isDeleted:newRoom.isDeleted, createdAt:newRoom.createdAt, updatedAt:newRoom.updatedAt};

        }else{
            const chat = await Models.Room.findOne({_id:room, isActive:true, isDeleted:false})
                                .select('-__v')
                                .populate({
                                    path:'conversations',
                                    match:{isActive:true, isDeleted:false},
                                    select:'-__v'
                                });
            let data =[];
            chat.conversations.map(conversation => {
                data.push({
                    _id:conversation._id.toString(),
                    author: conversation.author,
                    message: conversation.message,
                    isActive: conversation.isActive,
                    isDeleted: conversation.isDeleted,
                    createdAt: conversation.createdAt,
                    updatedAt: conversation.updatedAt
                })
            });

            return {_id:chat._id.toString(), room: chat.room, participants:chat.participants, isActive:chat.isActive, isDeleted:chat.isDeleted, createdAt:chat.createdAt, updatedAt:chat.updatedAt, conversations: data};
        }
    },

    launchRoom: async({participants}, req) => {
        const errors = [];
        if(Validator.isEmpty(participants)) errors.push({message:"Please specify participants"});
        if(errors.length > 0 ){
            let err = new Error("Incomplete params");
            err.data = errors;
            err.code = 422;
            throw err;
        }
        let parsedParticipants = participants.split(",").sort();

        const myChat = await Models.Room.findOne({
                                        participants: parsedParticipants,
                                        isActive:true, isDeleted:false
                                    });
        if(!myChat){
            const Room = new Models.Room({
                room:"",
                participants: parsedParticipants
            });
            const newRoom = await Room.save();

            return {_id:newRoom._id.toString(), room: newRoom.room, participants:newRoom.participants, isActive:newRoom.isActive, isDeleted:newRoom.isDeleted, createdAt:newRoom.createdAt, updatedAt:newRoom.updatedAt, conversations:[]};
        }
        let data =[];
        //this is because, array query does not support populate in $all:[]
        let chat = await Models.Room.findOne({_id:myChat._id})
                               .populate({
                                    path:'conversations',
                                    match:{isActive:true, isDeleted:false},
                                });
                                
        chat.conversations.map(conversation => {
            data.push({
                _id:conversation._id.toString(),
                author: conversation.author,
                message: conversation.message,
                isActive: conversation.isActive,
                isDeleted: conversation.isDeleted,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            })
        });

        return {_id:myChat._id.toString(), room: myChat.room, participants:myChat.participants, isActive:myChat.isActive, isDeleted:myChat.isDeleted, createdAt:myChat.createdAt, updatedAt:myChat.updatedAt, conversations: data};
    }

}


