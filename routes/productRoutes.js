import express from 'express'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js'
import { createProductController, getProductController,braintreeTokenController,brainTreePaymentController, searchProductController, getSingleProductController,productFiltersController,updateProductController, productDeleteController, productPhotoController } from '../controllers/productController.js'
import formidable from 'express-formidable'

const router = express.Router()

//routes
router.post('/create-product',requireSignIn,isAdmin,formidable(),createProductController)

//get products
router.get('/get-product', getProductController)

//get single product
router.get('/get-product/:slug', getSingleProductController)


//get photo
router.get('/product-photo/:pid',productPhotoController)

//delete product
router.delete('/delete-product/:pid',requireSignIn,isAdmin,productDeleteController)

//update route
router.put('/update-product/:pid',requireSignIn,isAdmin,updateProductController)

//filter product
router.post('/product-filters',productFiltersController)

//search
router.get('/search/:keyword',searchProductController)


//product route
//token
router.get('/braintree/token', braintreeTokenController)

//payment
router.post('/braintree/payment',requireSignIn,brainTreePaymentController)

export default router