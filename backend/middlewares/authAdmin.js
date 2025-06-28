import jwt from 'jsonwebtoken';

// admin authentication middleware
const authAdmin = (req, res, next) => {

    try{

        const { atoken } = req.headers;
        if (!atoken) {
            return res.json({ message: "Not authorized, login again" });
        }

        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ message: "Not authorized, login again" });
        }

        next();

    }
    catch(error) {
        console.error("Error in authAdmin middleware:", error);
        return res.json({ message: "Internal server error" });
    }

}

export default authAdmin;