import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from 'jsonwebtoken';

export const registerController=async(req,res)=>{
try{
    const {name,email,password,phone,address} = req.body
    //validations
    if(!name){
        return res.send({message: 'Name is required'})
    }
    if(!email){
        return res.send({message: 'Email is required'})
    }
    if(!password){
        return res.send({message: 'Password is required'})
    }
    if(!phone){
        return res.send({message: 'Phone number is required'})
    }
    if(!address){
        return res.send({message: 'Address is required'})
    }
    //check user
    const existingUser = await userModel.findOne({email})
    //existing user
    if(existingUser){
        res.status(200).send({
            success:false,
            message:'Already Register please login',
        })
    }
    //register user
    const hashedPassword = await hashPassword(password)
    //save
    const user = await new userModel({name,email,phone,address,password:hashedPassword}).save()
    res.status(201).send({
        success:true,
        message:'User registered succsessfully',
        user

    })
}catch(error){
console.log(error);
res.status(500).send({
    success:false,
    message:'Error in registration',
    error
})
}
};

export const loginController= async(req,res)=>{
    try{
        const {email,password}=req.body
        if(!email || !password){
            return res.status(404).send({
                success:false,
                message:'Invalid email or password'
            })
        }
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Email is not registered'
            })
        }
        const match = await comparePassword(password,user.password)
        if(!match){
            return res.status(200).send({
                success:false,
                message:'Invalid Password'
            })
        }
        const token = await JWT.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.status(200).send({
            success:true,
            message:'loggedIn successfully',
            user: {
                name:user.name,
                email:user.email,
                phone:user.phone,
                address: user.address,
                role:user.role,
                
            },
            token,
        });
    }catch(error){
        console.log(error);
    res.status(500).send({
    success:false,
    message:'Error in login',
    error
    })
}
}

export const profileUpdateController=async(req,res)=>{
    try{
    const {name,email,phone,address,} = req.body
    switch(true){
        case !name: 
                return res.status(500).send({error:'Name is Required'})
        case !email: 
                return res.status(500).send({error:'emai is Required'})        
        case !phone: 
                return res.status(500).send({error:'phone is Required'})
        case !address: 
                return res.status(500).send({error:'address is Required'})
    }
    const updatedUser  = await userModel.findOneAndUpdate( { email: email },
        {name,email,phone,address},{new:true}
        );
        await updatedUser .save()
        res.status(201).send({
            success:true,
            message:'Profile Updated successfully',
            updatedUser ,
        });
   

    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in updating profile'
        })
    }
}


export const testController=(req,res)=>{
    res.send('Protected route');
}

export const getOrdersController=async(req,res)=>{
    try{
        const orders = await orderModel.find({buyer:req.user._id}).populate("products","-photo").populate("buyer","name")
        res.json(orders)
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in handling orders',
            error
        })
    }
}

export const getAllOrdersController=async(req,res)=>{
    try{
        const orders = await orderModel.find({}).populate("products","-photo").populate("buyer","name")
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in handling orders',
            error
        })
    }
}
