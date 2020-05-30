const express = require("express");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const { devConnection, prodConnection } = require('./config/database');
const mongoDbStore = require('connect-mongodb-session')(session);
const cors = require('cors');
const validateRequestMiddleware = require('./middleware/validateRequestMiddleware');

import graphqlHttp from 'express-graphql';
import graphqlSchema from './graphql/schema';
import graphqlResolver from './graphql/resolver';
import EDcrypter from './lib/EDcrypter';


class App {
    constructor(){
        this.app = express();
        this.port = 8087;
        this.server = '';
        this.initDB();
        this.initExpressMiddleware();
        this.customMiddleware();

        this.initGraphQl();
        // this.initSession(); //this is not required 
        // this.cors();
        this.initRoutes();
        this.start();
        this.testHere();
    }

    initDB(){
        const options = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            autoIndex: false, // Don't build indexes
            connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
            socketTimeoutMS: 30000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
          };
        mongoose.connect(prodConnection, options).then( 
            ()=> { console.log("DB is ready") },
            err => {console.log("DB is not ready yet, check connection", err.message)}
            );
        
        //debug true -- remove in prod
        mongoose.set('debug', true);
        
    }

    initGraphQl(){
        this.app.use('/apis', graphqlHttp({
            schema: graphqlSchema,
            rootValue:graphqlResolver,
            graphiql:true,
            formatError(err){
                if(!err.originalError){ return err; }
                const errorData = err.originalError.data;
                const message = err.message || "An error occurred";
                const code = err.originalError.code || 500;
                return { message: message, status: code, data:errorData}
            }
        }));
    }

    initExpressMiddleware(){
        this.app.use(morgan('dev'));
        this.app.use(bodyParser.urlencoded({extended:false}));
        this.app.use(bodyParser.json());
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(helmet.noCache());
        this.app.use(helmet.frameguard());
    }

    customMiddleware(){
        if(!this.app.get('env') === 'development') {
            this.app.use(validateRequestMiddleware);
        }
    }

    initSession(){
        let store = new mongoDbStore({
            uri:devConnection,
            collection:'sessions'
        });
        let sess = {
            secret: 'Whisky secrete key ',
            cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
            resave: false,
            saveUninitialized: true,
            store:store
        }
        //catch error
        store.on('error', function(error) {
            assert.ifError(error);
            assert.ok(false);
        });

        if (this.app.get('env') === 'production') {
            this.app.set('trust proxy', 1) // trust first proxy
            sess.cookie.secure = true // serve secure cookies
        }
        this.app.use(session(sess));
    }

    initRoutes(){
        this.app.get('/',(req, res, next) => {
            res.status(200).json({App:"Chat service", message:"Booted up"});

        });


        // undefined routes
        this.app.use((req, res, next) => {
            let err = new Error('Resource Not Found');
            err.status = 404;
            next(err);
        });
        
        //internal server error handling
        this.app.use((e, req, res, next) => {
            let status = e.status || 500;
            let error = { message: e.message };
            if (this.app.get('env') === 'development') {
                error.message = status + ' ' + e;
                res.status(status).send(error);
            } else {
                console.log(error);
                res.status(status).json(error);
            }
        });
    }

    start(){

        this.server = this.app.listen(this.port, () => console.log(`Whiskybase is ready to move in ${this.port}!`));
        this.initIoConnection();
        this.app.use((error, req, res, next) => {
            res.status(error.status || 500);
            res.json({status:"fail", error:error.message});
        });
    }
    //cors protection
    // cors(){
    //     this.app.use((req,res, next) => {
    //         res.header('Access-Control-Allow-Origin', '*');
    //         res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    //         if(req.method ==='OPTIONS'){
    //             res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
    //             return res.status(200).json({});
    //         }
    //         next();
    //     });
    // }

    //io initiation
    initIoConnection(){
        const io = require('socket.io')(this.server);
        //establishing socket connection with namespace 

        io.on('connection', (socket) => {
            console.log('Socket is listening on: '+this.port);
        
            //default username
            socket.username = "Anonymous"
        
            //listen on change_username
            socket.on('change_username', (data) => {
                socket.username = data.username
            })
        
            //listen on new_message
            socket.on('new_message', async(data) => { 
                console.log("new_message",data)
                const conversation = await graphqlResolver.createConversation({
                            conversation:{
                                author:data.author,
                                room:data.room,
                                message:data.message
    
                            }
                        });
                
                console.log("data room",data.room)
                //broad cast the message to listening users
                socket.broadcast.emit(data.room, {message : data.message, username : data.username,author:data.author,room:data.room,listenerId:data.listenerId});

            });


             socket.on('notification', async(data) => { 
                
                socket.broadcast.emit(data.listenerId, {message : data.message, username : data.username,author:data.author,room:data.room,listenerId:data.listenerId});

            });
        
            //listen on typing
            socket.on('typing', (data) => {
                socket.broadcast.emit('typing', {username : socket.username})
            })
        });
    }

    testHere(){
        // const peerChat = new PeerChat();
        
    }
}
new App();