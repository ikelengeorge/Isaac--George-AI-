const { editPhoto } = require("../services/photo");


module.exports = {

name: "edit",


async execute(args, user){

    const instruction = args.join(" ");

    if(!instruction){
        return "Please describe how you want the photo edited";
    }


    return await editPhoto(instruction);

}

};
