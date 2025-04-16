import Users from "../models/UserModel.js";
import argon2 from "argon2";

export const login = async (req, res) => {
    const user = await Users.findOne({
        where: {
            email: req.body.email
        }
    });
    if(!user) return res.status(404).json({error: "User not found"});

    const match = await argon2.verify(user.password, req.body.password);
    if(!match) return res.status(400).json({error: "Wrong Password"});

    req.session.userId = user.uuid;
    const uuid = user.uuid;
    const username = user.username;
    const email = user.email;
    res.status(200).json({uuid, username, email});
};

export const Me = async (req, res) => {
    if(!req.session.userId){
        return res.status(401).json({error: "Login to your account first!"});
    }
    const user = await Users.findOne({
        attributes: ['uuid', 'username', 'email'],
        where: {
            uuid: req.session.userId
        }
    });
    if(!user) return res.status(404).json({msg: "User not found!"});
    res.status(200).json(user);
};

export const logOut = async (req, res) => {
    req.session.destroy((err)=>{
        if(err) return res.status(400).json({error:"Logout failed"});
        res.status(200).json({msg: "Logout successful"});
    });
};