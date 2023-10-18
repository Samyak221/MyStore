import slugify from "slugify";
import productModel from "../models/productModel.js";
import fs from 'fs'
import orderModel from "../models/orderModel.js";
import braintree from "braintree";
import dotenv from 'dotenv'

dotenv.config();

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY ,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  });

export const createProductController = async(req,res)=>{
    try{
        const {name,slug,description,price,category,quantity,shipping} = req.fields
        const {photo} = req.files

        switch(true){
            case !name: 
                    return res.status(500).send({error:'Name is Required'})
            case !description: 
                    return res.status(500).send({error:'Description is Required'})        
            case !price: 
                    return res.status(500).send({error:'Price is Required'})
            case !category: 
                    return res.status(500).send({error:'Category is Required'})
            case !quantity: 
                    return res.status(500).send({error:'Quantity is Required'})
            case photo && photo.size>1000000: 
                    return res.status(500).send({error:'Photo is Required and should be less than 1 MB'})
  }


        const products = await productModel({...req.fields,slug:slugify(name)})
        if(photo){
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }
        await products.save()
        res.status(201).send({
            success:true,
            message:'Product created successfully',
            products,
        });
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in creating product'
        })
    }

};

export const getProductController = async(req,res)=>{
    try{
        const products = await productModel.find({});
        res.status(200).send({
            success:true,
            message:"All products",
            products,
        });
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in getting products",
            error:error.message
        })

    }
}

export const getSingleProductController = async(req,res)=>{
    try{
        const product = await productModel.findOne({slug:req.params.slug}).select("-photo").populate("category")
        res.status(200).send({
            success:true,
            message:'Single Product fetched',
            product
        })
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in getting product",
            error,
        });
    }
}

export const productPhotoController = async(req,res)=>{
try{
    const product = await productModel.findById(req.params.pid).select("photo")
    if(product.photo.data){
        res.set('Content-type',product.photo.contentType);
        return res.status(200).send(product.photo.data);
    }
}catch(error){
    console.log(error)
    res.status(500).send({
        success:false,
        message:"Error in getting photo",
        error,
    });
}
}


export const productDeleteController = async(req,res)=>{
    try{
        await productModel.findByIdAndDelete(req.params.pid).select("-photo")
        res.status(200).send({
            success:true,
            message: 'Product Deleted!!!'
        })
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error in deleting photo",
            error,
        });
    }
}

export const updateProductController=async(req,res)=>{
    try{
        const {name,slug,description,price,category,quantity,shipping} = req.fields
        const {photo} = req.files

        switch(true){
            case !name: 
                    return res.status(500).send({error:'Name is Required'})
            case !description: 
                    return res.status(500).send({error:'Description is Required'})        
            case !price: 
                    return res.status(500).send({error:'Price is Required'})
            case !category: 
                    return res.status(500).send({error:'Category is Required'})
            case !quantity: 
                    return res.status(500).send({error:'Quantity is Required'})
            case photo && photo.size>1000000: 
                    return res.status(500).send({error:'Photo is Required and should be less than 1 MB'})
  }


        const products = await productModel.findByIdAndUpdate(req.params.pid,
            {...req.fields, slug:slugify(name)},{new:true}
            );
        if(photo){
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }
        await products.save()
        res.status(201).send({
            success:true,
            message:'Product Updated successfully',
            products,
        });
    }catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in updating product'
        })
    }

}

export const productFiltersController=async(req,res)=>{
try{
    const {checked,radio} = req.body;
    let args = {}
    if(checked.length>0){
        args.category = {$in:checked};
    }
    if(radio.length)args.price = {$gte:radio[0], $lte:radio[1]};
    const products= await productModel.find(args);
    res.status(200).send({
        success:true,
        products,
    });
}catch(error){
    console.log(error)
    res.status(400).send(
        {
            success:false,
            message:'Error in filtering products',
            error
        }
    )
}
}

export const searchProductController=async(req,res)=>{
try{
    const {keyword} = req.params
    const result = await productModel.find({
        $or:[
            {name:{$regex: keyword, $options:"i"}},
            {description:{$regex: keyword, $options:"i"}}
        ]

    }).select("-photo");
    res.json(result);
}catch(error){
    console.log(error)
    res.status(400).send(
        {
            success:false,
            message:'Error in searching product',
            error
        }
    )
}
}


export const braintreeTokenController=async(req,res)=>{
    try {
        gateway.clientToken.generate({}, function (err, response) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.send(response);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };

export const brainTreePaymentController=async()=>{
    try {
        const { nonce, cart } = req.body;
        let total = 0;
        cart.map((i) => {
          total += i.price;
        });
        let newTransaction = gateway.transaction.sale(
          {
            amount: total,
            paymentMethodNonce: nonce,
            options: {
              submitForSettlement: true,
            },
          },
          function (error, result) {
            if (result) {
              const order = new orderModel({
                products: cart,
                payment: result,
                buyer: req.user._id,
              }).save();
              res.json({ ok: true });
            } else {
              res.status(500).send(error);
            }
          }
        );
      } catch (error) {
        console.log(error);
      }
    };