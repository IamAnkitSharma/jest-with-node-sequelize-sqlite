const express = require("express");
const router = express.Router();
const UserService = require("../services/user");
const { check, validationResult } = require("express-validator");

router.post(
  "/users",
  [
    check("username", "username empty").notEmpty().bail().isLength({min:3,max:32}).withMessage("Username min length 3 , max length 32"),
    check("email", "email empty").notEmpty().bail().isEmail().withMessage("Invalid Email")
    .bail()
    .custom(async(email)=>{
      if(await UserService.findByEmail(email)){
        throw new Error("E-mail in use")
      }
    }),
    check("password", "password empty").notEmpty().bail().isLength({min:6}).withMessage("password min length 6 "),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({
        msg: errors.array()[0].msg,
      });
    }
    try {
      const response = await UserService.save(req.body);
      if (response) {
        res.json(response);
      } else {
        res.status(500).json({
          msg: "Error while saving user",
        });
      }
    } catch (error) {
      res.status(500).json({
        msg: "Some Internal Error Occured",
      });
    }
  }
);
module.exports = router;
