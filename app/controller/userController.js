import models from '../models'; 

class UserController {
    constructor(){}

    listUser(req, res, next){
        res.status(200).json({App:"Whiskybase", message:"User List"});
    }
    createUser(req, res, next){
        
    }
}

export default new UserController;