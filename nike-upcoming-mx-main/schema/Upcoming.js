const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RegionSchema = new Schema({
    
    product_name: {
        type: String,
        required: true,
        
    },
    link: {
        type: String,
        required: true,
        
    },
    sizelist: {
        type: String,
        required: true,
        
    },
    product_id: {
        type: String,
        required: true,
        unique:true
        
    },
    style_code: {
        type: String,
        required: true,
        
    },
    release_time: {
        type: String,
        required: true,
        
    },
    image_link: {
        type: String,
        required: true,
        
    },
    release_method: {
        type: String,
        required: true,
        
    },
    product_price: {
        type: String,
        required: true,
        
    },
    product_status: {
        type: String,
        required: true,
        
    },
    product_access: {
        type: String,
        required: true,
        
    },

},{strict:false });
module.exports = mongoose.model('upcoming', RegionSchema);