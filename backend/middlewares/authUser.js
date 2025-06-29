import jwt from 'jsonwebtoken';

// user authentication middleware
const authUser = (req, res, next) => {

    try{

        const { token } = req.headers;
        if (!token) {
            return res.json({ message: "Not authorized, login again" });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        req.userId = token_decode.id;

        next();

    }
    catch(error) {
        console.error("Error in authAdmin middleware:", error);
        return res.json({ message: error.message });
    }

}

export default authUser;