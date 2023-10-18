import express from 'express'
import { categoryController, createCategoryController, updateCategoryController, singleCategoryController, deleteCategoryController } from '../controllers/categoryController.js'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
const router= express.Router()

//create Routes
router.post('/create-category', requireSignIn,isAdmin, createCategoryController)

//update Routes
router.put('/update-category/:id', requireSignIn,isAdmin, updateCategoryController)

//get category
router.get('/get-category', categoryController)

//get single category
router.get('/single-category/:slug', singleCategoryController)

//delete category

router.delete('/delete-category/:id', requireSignIn,isAdmin, deleteCategoryController)



export default router