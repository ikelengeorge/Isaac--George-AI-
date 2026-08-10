const { generateVideo } = require("../services/video");


module.exports = {

name: "video",


async execute(args, user){

    const prompt = args.join(" ");

    if(!prompt){
        return "Please describe the video you want";
    }


    return await generateVideo(prompt);

}

};
