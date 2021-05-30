const Discord = require('discord.js');
const axios = require('axios');
const mongoose = require('mongoose');
const Upcoming = require('./schema/Upcoming');
const {comparer} = require('./comparer/utils');


const client = new Discord.Client();

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    //Set Bot Presence in Discord
    client.user.setPresence({
        status: "online",
        activity: {
            // The message shown
            name: `${process.env.BOT_STATUS}`,
            // PLAYING, WATCHING, LISTENING, STREAMING
            type: "WATCHING"
        }
    });
    //Connecting to mongo db
    mongoose.connect(`${process.env.MONGODB_URI}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(
        () => {
            //Tell Database is Connected
            console.log('Database is connected')
            //Set interval of scraping
            setInterval(ScrapUpcoming, `${process.env.SCRAP_INTERVAL}`);
        }, //If cannot connect to database
        err => {
            //Tell Database is no connected 
            console.log('Can not connect to the database' + err)
        }
    );
});

//Scrap Upcoming SNKRS
function ScrapUpcoming() {

    //Start Task
    (async() => {

        //Set Flag value to check same data insertion
        let flag=false

        //Product names array
        let productNames = [];
        //Product links array
        let links = [];
        //Product sizelist & stocks array
        let sizelists = [];
        //Product image array
        let images = [];
        //Product color coded array
        let colorcodes = [];
        //Product price array
        let prices = [];
        //Product exclusive access array
        let exclusiveaccesses = [];
        //Product release date array
        let releasetimes = [];
        //Product release method array
        let methods = [];
        //Product id array
        let productids = [];
        //product style code array
        let stylecodes = [];

        //Store Product Data
        let products = [];

        //Request API
        const response = await axios.get(`https://api.nike.com/product_feed/threads/v2/?anchor=0&count=36&filter=marketplace%28${process.env.REGION_API}%29&filter=language%28${process.env.LANG_API}%29&filter=channelId%28010794e5-35fe-4e32-aaff-cd2c74f89d61%29&filter=exclusiveAccess%28true%2Cfalse%29&fields=active%2Cid%2ClastFetchTime%2CproductInfo%2CpublishedContent.nodes%2CpublishedContent.subType%2CpublishedContent.properties.coverCard%2CpublishedContent.properties.productCard%2CpublishedContent.properties.products%2CpublishedContent.properties.publish.collections%2CpublishedContent.properties.relatedThreads%2CpublishedContent.properties.seo%2CpublishedContent.properties.threadType%2CpublishedContent.properties.custom%2CpublishedContent.properties.title`);
        // to check if object in api contains "productInfo"
        for(obj of response.data.objects) {
            if(obj.productInfo) {
                // if object contains multiple products
                if(obj.publishedContent.properties.threadType == 'multi_product') {
                    obj.productInfo.forEach((product) => {
                        if (product.hasOwnProperty('launchView')=== false) {
                            return;
                        }
                        //Obtain product data
                        let name = (obj.publishedContent.properties.seo.title).replace("Release Date", "")
                        let cw = (product.productContent.colorDescription)
                        let image = product.imageUrls.productImageUrl
                        let price = product.merchPrice.currentPrice
                        let currency = product.merchPrice.currency
                        let ea = product.merchProduct.exclusiveAccess
                        let code = product.merchProduct.styleColor
                        let id = product.launchView.productId
                        let url = (`https://www.nike.com/${process.env.REGION_LINK}/launch/t/`) + obj.publishedContent.properties.seo.slug

                        // if productInfo has "launchView" as property is true check if it contains a method
                        // if it does, let "lm" be the method found
                        var stock = ((product.skus).length)
                        var sizes = [];
                        var i;
                        
                        //Obtain product size and stock 
                        for(i = 0; i < stock; i++) {
                            if(product.availableSkus[i].level == "LOW")
                            {
                                sizes.push(`${product.skus[i].nikeSize}-:red_circle:-LOW`)
                            }
                            else if(product.availableSkus[i].level == "MEDIUM")
                            {
                                sizes.push(`${product.skus[i].nikeSize}-:yellow_circle:-MEDIUM`)
                            }
                            else if(product.availableSkus[i].level == "HIGH")
                            {
                                sizes.push(`${product.skus[i].nikeSize}-:green_circle:-HIGH`)
                            }
                            else
                            {
                                sizes.push(`${product.skus[i].nikeSize}-:x:-OOS`)
                            }
                        }
                        //Join obtained size and stock data
                        var sizelist = sizes.join('\n')

                        //Obtain product data
                        if(product.hasOwnProperty('launchView') == true) {
                            var lt = (product.launchView.startEntryDate).replace("T", " ").replace("Z", " ") + " +2h"
                            if(product.launchView.hasOwnProperty('method') == true) {
                                var lm = (product.launchView.method)
                            } else {
                                var lm = "n/a"
                            }
                        }
                        
                        //Push all obtained data into arrays
                        productNames.push(name)
                        links.push(url)
                        sizelists.push(sizelist)
                        productids.push(id)
                        stylecodes.push(code)
                        releasetimes.push(lt)
                        images.push(image)
                        methods.push(lm)
                        prices.push(`${currency} ${price}`)
                        colorcodes.push(cw)
                        exclusiveaccesses.push(ea)
                    })
                }
                // if object contains single products
                else if(obj.publishedContent.properties.threadType == 'product') {
                    obj.productInfo.forEach((product) => {
                        if (product.hasOwnProperty('launchView') === false) {
                            return;
                        }
                        //Obtain product data
                        let name = (obj.publishedContent.properties.seo.title).replace("Release Date", "")
                        let cw = (product.productContent.colorDescription)
                        let image = product.imageUrls.productImageUrl
                        let price = product.merchPrice.currentPrice
                        let currency = product.merchPrice.currency
                        let ea = product.merchProduct.exclusiveAccess
                        let code = product.merchProduct.styleColor
                        let id = product.launchView.productId
                        let url = (`https://www.nike.com/${process.env.REGION_LINK}/launch/t/`) + obj.publishedContent.properties.seo.slug
                        
                        // if productInfo has "launchView" as property is true check if it contains a method
                        // if it does, let "lm" be the method found
                        var stock = ((product.skus).length)
                        var sizes = [];
                        var i;

                        //Obtain product data
                        for(i = 0; i < stock; i++) {
                            if(product.availableSkus[i].level == "LOW")
                            {
                                sizes.push(`${product.skus[i].nikeSize}-:red_circle:-LOW`)
                            }
                            else if(product.availableSkus[i].level == "MEDIUM")
                            {
                                sizes.push(`${product.skus[i].nikeSize}-:yellow_circle:-MEDIUM`)
                            }
                            else if(product.availableSkus[i].level == "HIGH")
                            {
                                sizes.push(`${product.skus[i].nikeSize}-:green_circle:-HIGH`)
                            }
                            else
                            {
                                sizes.push(`${product.skus[i].nikeSize}-:x:-OOS`)
                            }
                        }
                        //Join obtained size and stock data
                        var sizelist = sizes.join('\n')

                        //Obtain product data
                        if(product.hasOwnProperty('launchView') == true) {
                            var lt = (product.launchView.startEntryDate).replace("T", " ").replace("Z", " ")
                            if(product.launchView.hasOwnProperty('method') == true) {
                                var lm = (product.launchView.method)
                            } else {
                                var lm = "n/a"
                            }
                        }
                        
                        //Push all obtained data into array
                        productNames.push(name)
                        links.push(url)
                        sizelists.push(sizelist)
                        productids.push(id)
                        stylecodes.push(code)
                        releasetimes.push(lt)
                        images.push(image)
                        methods.push(lm)
                        prices.push(`${currency} ${price}`)
                        colorcodes.push(cw)
                        exclusiveaccesses.push(ea)
                    })
                }
            }
        }

        //Store all pushed products data in an array
        for (let i = 0; i < productNames.length; i++) {
            products.push({
                'product_name': productNames[i],
                'link': links[i],
                'sizelist':sizelists[i],
                'product_id':productids[i],
                'style_code':stylecodes[i],
                'release_time':releasetimes[i],
                'image_link':images[i],
                'release_method':methods[i],
                'product_price':prices[i],
                'product_status':colorcodes[i],
                'product_access':exclusiveaccesses[i]
            });
        }

        //Take data fron mango DB to compare
        let data = []

        //Fetching all the previous data from mongoDB
        try {
            data = await Upcoming.find({}, '-_id -__v');
        }
        //If error fetching data from mongodb
        catch (err) {
            console.log("Unable to query the database", err)
        }

        let UpcomingData = {products:data}

        //Compare data in website and db
        let UpcomingProducts = comparer(products, UpcomingData.products);

        if (UpcomingProducts.length < 1 || UpcomingProducts.length == 0 ) {
        } 
        else {
            //If new product detected
            if (UpcomingProducts.length > 0) {
                for (let i = 0; i < UpcomingProducts.length; i++) {
                    //Add element
                    const element = UpcomingProducts[i];
                    //Add datas into embed fields
                    const productEmbed = new Discord.MessageEmbed()
                        //Set Message Author
                        .setAuthor(`${process.env.SITE_NAME} (${process.env.CATEGORY_NAME_NEW})`, `${process.env.BRANDING_LOGO}`, `${UpcomingProducts[i].link}`)
                        //Set message color
                        .setColor(`${process.env.COLOR}`)
                        //Set message title
                        .setTitle((`${UpcomingProducts[i].product_name}`).toUpperCase())
                        //Set message url
                        .setURL(`${UpcomingProducts[i].link}`)
                        //Set Fields
                        .addFields(
                            { 
                                name: 'Site:', 
                                value: `${process.env.SITE_NAME}`, 
                                inline:true 
                            },
                            { 
                                name: 'Category:', 
                                value: `${process.env.CATEGORY_NAME_NEW}`, 
                                inline:true 
                            },
                            { 
                                name: 'Region:', 
                                value: `${process.env.REGION_SHOP}`, 
                                inline:true 
                            },
                            { 
                                name: 'Release Type:', 
                                value: `${UpcomingProducts[i].release_method}`, 
                                inline:true 
                            },
                            { 
                                name: 'Style Code:', 
                                value: `${UpcomingProducts[i].style_code}`, 
                                inline:true 
                            },
                            { 
                                name: 'Early Link:', 
                                value: "[Copy](" + UpcomingProducts[i].link + "?productId=" + UpcomingProducts[i].product_id + "&size=)", 
                                inline:true 
                            },
                            { 
                                name: 'Stock Level:', 
                                value: "[Check](https://api.nike.com/deliver/available_gtins/v2/?filter=styleColor%28"+ UpcomingProducts[i].style_code + "%29&filter=merchGroup%28XA%29)", 
                                inline:true 
                            },
                            { 
                                name: 'Price:', 
                                value: `${UpcomingProducts[i].product_price}`, 
                                inline:true 
                            },
                            { 
                                name: 'Exclusive Access:', 
                                value: (`${UpcomingProducts[i].product_access}`).toUpperCase(), 
                                inline:true 
                            },
                            { 
                                name: 'Size & Stock:', 
                                value: `${UpcomingProducts[i].sizelist}`, 
                                inline:false
                            },
                            { 
                                name: 'Colorway:', 
                                value: `${UpcomingProducts[i].product_status}`, 
                                inline:false
                            },
                            { 
                                name: 'Release Date:', 
                                value: UpcomingProducts[i].release_time.split(" ")[0], 
                                inline:false
                            },
                            { 
                                name: 'Other Links:', 
                                value: "[Cart]"+"(https://www.nike.com/cart)" + " | " + "[StockX]" + "(https://stockx.com/search?s="+ UpcomingProducts[i].style_code +")" +" | " + "[eBay]" + "(https://www.ebay.com/sch/i.html?_from=R40&_trksid=p2499334.m570.l1313&_nkw="+UpcomingProducts[i].style_code+")" +" | " + "[Goat]" + "(https://www.goat.com/search?query="+UpcomingProducts[i].style_code+"&_sacat=0)" 
                            }
                        )
                        //Set timestamp
                        .setTimestamp()
                        //Set thumbnails
                        .setThumbnail(`${UpcomingProducts[i].image_link}`)
                        //Set footer
                        .setFooter(`${process.env.BRANDING_WORDS}`, `${process.env.BRANDING_LOGO}`);
                        
                    //Check if same unique data exist
                    let d = await Upcoming.find({link: element.link});

                    //Check Link
                    if (d && d.length==0){
                        if (client.channels.cache.get(`${process.env.DISCORD_CHANNEL_ID_NEW}`)){
                            //Try to insert data into MongoDB and send to discord
                            try{
                                //Insert Data into MongoDB
                                await Upcoming.insertMany([element]);
                                //Post Message to channel
                                client.channels.cache.get(`${process.env.DISCORD_CHANNEL_ID_NEW}`).send(productEmbed);
                                //Set Flag to true
                                flag=true;
                            }
                            //Catch Errors inserting data
                            catch(e){
                            }
                        }
                    }
                }
                //Print Result
                if (flag){
                }
                else{
                }
            }
        }

    })();
}

//Discord Bot Token
client.login(`${process.env.DISCORDJS_BOT_TOKEN}`);