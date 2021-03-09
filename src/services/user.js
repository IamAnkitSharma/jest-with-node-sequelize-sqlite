const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")
const genToken = (len) =>{
  return crypto.randomBytes(len).toString('hex').substring(0,len)
}
const save = async (body) => {
  return new Promise(async(resolve)=>{

    const {username,email,password} = body
    const hash = await bcrypt.hash(password,10)
    const user = {username,email,password:hash,activationToken:genToken(30)}

    User.create(user).then(() => {
      resolve({
            message: "User Created",
      });
    });
    
  })
};
const findByEmail = async(email) =>{
    return await User.findOne({where:{email:email}})
}
module.exports = {save , findByEmail}