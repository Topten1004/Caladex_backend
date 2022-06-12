const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const base = require('./baseController');
const { KeyObject } = require("crypto");

const createToken = (id, email) => {
    return jwt.sign({
            id: id,
            email: email
        },
        process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        },
    );
};

var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{3})+$/;

/**
 * Login user and create token
 *
 * @param  [string] email
 * @param  [string] password
 * @param  [boolean] remember_me
 * @return [string] access_token
 * @return [string] token_type
 * @return [string] expires_at
 */
exports.login = async(req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1) check if email and password exist
        if (!email || !password) {
            return next(
                new AppError(201, "fail", "Please provide email or password"),
                req,
                res,
                next,
            );
        }

        if(!email.match(mailformat)) {
            return next(
                new AppError(201, "fail", "Invalid Email"),
                req,
                res,
                next,
            );
        }

        if(password.length < 8 ) {
            return next(
                new AppError(201, "fail", "Your password must be longer than 8 characters."),
                req,
                res,
                next,
            );
        }
        // 2) check if user exist and password is correct
        const user = await User.findOne({
            email,
        }).select("+password");

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(
                new AppError(201, "fail", "Email or Password is wrong"),
                req,
                res,
                next,
            );
        }

        // if (user.active == false) {
        //     return next(
        //         new AppError(201, "fail", "Not allowed yet!"),
        //         req,
        //         res,
        //         next,
        //     );
        // }

        // if(is_admin == true && !user.menuroles.includes("admin")) {
        //     return next(
        //         new AppError(201, "fail", "You are not admin"),
        //         req,
        //         res,
        //         next,
        //     );
        // }

        // 3) All correct, send jwt to client  g
        const token = createToken(user.id, user.email);

        // Remove the password from the output
        user.password = undefined;

        res.status(200).json({
            status: "success",
            token,
            data: {
                user,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.signup = async(req, res, next) => {
    try {

        const {email, password, password_confirmation} = req.body;

        if (!email || !password || !password_confirmation) {
            return next(
                new AppError(201, "fail", "Please provide email or password"),
                req,
                res,
                next,
            );
        }

        if(!email.match(mailformat)) {
            return next(
                new AppError(201, "fail", "Invalid Email"),
                req,
                res,
                next,
            );
        }

        const finduser = await User.findOne({ email });
        if(finduser) {
            return next(
                new AppError(201, "fail", "E11000 duplicate key error"),
                req,
                res,
                next,
            );
        }

        if(password.length < 8 ) {
            return next(
                new AppError(201, "fail", "Your password must be longer than 8 characters."),
                req,
                res,
                next,
            );
        }

        if (password != password_confirmation) {
            return next(
                new AppError(201, "fail", "Your password and confirmation password are not the same."),
                req,
                res,
                next,
            );
        }

        const user = await User.create({
            email: email,
            password: password,
        });

        const token = createToken(user.id, user.email);
        
        // user.email_verify_code = undefined;
 
        user.password = undefined;

        res.status(200).json({
            status: "success",
            token,
            data: {
                user,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.changePassword = async(req, res, next) => {
    try {
        
        const { _id } = req.body;

        console.log(req.body);

        const user = await User.findOne({
            _id,
        }).select("+password");

        if(!user) {
            return next(
                new AppError(201, "fail", "User not exists"),
                req,
                res,
                next,
            );
        }

        console.log(user);
        if (!(await user.correctPassword(req.body.old_password, user.password))) {
            return next(
                new AppError(201, "fail", "Wrong old Paasword!"),
                req,
                res,
                next,
            );
        }

        console.log("1");

        if (req.body.password != req.body.password_confirmation) {
            return next(
                new AppError(201, "fail", "Wrong Confirm!"),
                req,
                res,
                next,
            );
        }
        console.log("2");

        user.password = req.body.password;
        console.log(user.password);
        user.save();

        res.status(200).json({
            status: "Successfully changed!",
        });
    } catch (err) {
        next(err);
    }
};


exports.logout = async(req, res, next) => {
    res.status(200).json({
        status: "success",
    });
};


exports.protect = async(req, res, next) => {
    try {
        // 1) check if the token is there
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return next(
                new AppError(
                    201,
                    "fail",
                    "You are not logged in! Please login in to continue",
                ),
                req,
                res,
                next,
            );
        }

        // 2) Verify token
        const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) check if the user is exist (not deleted)
        const user = await User.findById(decode.id);
        if (!user) {
            return next(
                new AppError(201, "fail", "This user is no longer exist"),
                req,
                res,
                next,
            );
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

// Authorization check if the user have rights to do this action
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.menuroles)) {
            return next(
                new AppError(201, "fail", "You are not allowed to do this action"),
                req,
                res,
                next,
            );
        }
        next();
    };
};