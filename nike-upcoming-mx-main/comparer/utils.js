export const comparer = (products,UpcomingProduct)=> {
    let find= false;
    let diff=[]
    for (let index = 0; index < products.length; index++) {
        const element = products[index];
        for (let idx = 0; idx < UpcomingProduct.length; idx++) {
            const ele = UpcomingProduct[idx];
            if ( element.product_name == ele.product_name 
                && element.link == ele.link 
                && element.sizelist == ele.sizelist 
                && element.product_id == ele.product_id 
                && element.style_code == ele.style_code
                && element.image_link == ele.image_link
                ){
                find=true;
            }
        }
        if (!find)
            diff.push(element)
        else
            find = false
    }
    return diff;
}