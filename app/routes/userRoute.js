import express from 'express';
import Routes from './index';
const router = express.Router();
import controller from '../controller'

router.get('/', controller.UserController.listUser);
router.post('/', controller.UserController.createUser);

module.exports = router;