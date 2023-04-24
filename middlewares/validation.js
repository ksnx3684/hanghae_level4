const { validationResult } = require("express-validator");

const validation = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){ // 에러가 존재한다면
        return res.status(412).json({ message: errors.array()[0].msg });
    }
    return next();
};

module.exports = validation;