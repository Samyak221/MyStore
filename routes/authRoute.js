import express from 'express';
import {registerController, loginController,profileUpdateController,getOrdersController,getAllOrdersController, testController} from '../controllers/authController.js'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
const router = express.Router()

//routing
//Register || Post method
router.post('/register',registerController)

//login || Post method
router.post('/login', loginController)

//test routes
router.get('/test',requireSignIn,isAdmin,testController)

//protected route auth user
router.get('/user-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true});
})

//protected route auth admin
router.get('/admin-auth',requireSignIn,isAdmin,(req,res)=>{
    res.status(200).send({ok:true});
})

router.put('/profile',requireSignIn,profileUpdateController)

//orders
router.get('/orders',requireSignIn,getOrdersController)

router.get('/all-orders',requireSignIn,isAdmin,getAllOrdersController)

export default router