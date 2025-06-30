import jwt from 'jsonwebtoken';

// doctor authentication middleware
const authDoctor = (req, res, next) => {

    try{

        const { dtoken } = req.headers;
        // console.log("Token received in authUser middleware:", token);
        if (!dtoken) {
            return res.json({ message: "Not authorized, login again" });
        }

        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
        
        req.docId = token_decode.id;

        next();

    }
    catch(error) {
        console.error("Error in authAdmin middleware:", error);
        return res.json({ message: error.message });
    }

}

export default authDoctor;