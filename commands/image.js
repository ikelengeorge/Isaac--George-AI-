const { generateImage } = require("../services/image");


module.exports = {

name: "image",


async execute(args, user){

    const prompt = args.join(" ");

    if(!prompt){
        return "Please describe the image you want";
    }


    return await generateImage(prompt);

}

};
