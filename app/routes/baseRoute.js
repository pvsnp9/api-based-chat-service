"use strict";
import express from 'express';
import controller from '../controller';
const router = express.Router();

class Routes {
    constructor(req, res, next){
        let object = this;
        let path = req.path; 
        path = path.substr(1);

        // if(req.path==='/'){
        //     object["home"](app,req, res, next);
        // }else {
        //     if(typeof (object[path]) === 'function'){
        //         object[path](app,req,res,next);
        //     }else{
        //         object["undefined"](app,req, res, next)
        //     }
        // }
        
    }
    undefined(app,req, res, next){
        let err = new Error('Resource Not Found');
        err.status = 404;
        next(err);
    }


    home(app, req, res, next){ 
        res.status(200).json({App:"Whiskybase", message:"Booted up"});
    }

    user(app,req, res, next){
        // console.log(req.method);
        app.use('/user', controller.UserController.listUser);
        // router.use((req, res, next)=>{ console.log('hereh');
        //     res.status(200).json({App:"Whiskybase", message:"User List"});
        //     // controller.UserController.listUser();
        // });
    }

    about(req, res, next){
        res.status(200).json({App:"Whiskybase", message:"About Section"});
    }

    chat(req, res, next){
        
    }

    
    
}

export default  Routes;