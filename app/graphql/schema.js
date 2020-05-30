import { buildSchema } from 'graphql';

module.exports = buildSchema(`
    type Conversation {
        _id: ID!
        author: String!
        message: String!
        isActive: Boolean
        isDeleted: Boolean
        createdAt: String
        updatedAt: String
    }

    type Chat {
        _id: ID!
        room: String
        participants:[String!]
        isActive: Boolean
        isDeleted: Boolean
        createdAt: String
        updatedAt: String
        conversations:[Conversation]
    }

    type Room {
        _id: ID!
        room: String,
        participants:[String!]
        isActive: Boolean
        isDeleted: Boolean
        createdAt: String
        updatedAt: String
    }

    type Rooms {
        room: [Room]
    }

    type Group {
        groups:[Room]
    }
    
    type RemoveConversation {
        _id: String!
        message: String!
    }

    type RemoveRoom {
        _id: String!
        message: String!
    }

    type Participants {
        participants: [String]
    }

    input conversationInputData {
        author: String!
        message: String!
        room: String!
    }

    type communicationData {
        fetchRooms: Rooms
        fetchRoom(roomId:ID!): Room!
        fetchChat(roomId:ID!): Chat
        fetchParticipants(roomId:ID!): Participants
        fetchAllMyChats(participantId:String!):Chat
        fetchMyRooms(participantId:ID!): Rooms
        anotherLaunchRoom(room:String, Participants:String): Chat
        launchRoom(participants:String!): Chat
        fetchMyGroup(participantId:String!): Group
    }
    
    type RootMutation {
        createRoom(room:String, Participants:String!): Room!
        createConversation(conversation: conversationInputData): Conversation!
        updateParticipants(roomId:ID!,Participant:String!, command:String!):Room!
        removeConversation(conversationId:ID!): RemoveConversation
        removeRoom(roomId:ID!): RemoveRoom
    }    
    schema {
        query: communicationData
        mutation: RootMutation
    }
`);

