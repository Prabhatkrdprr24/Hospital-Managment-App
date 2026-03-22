import multer from 'multer';

const storage = multer.diskStorage({
    // destination: function(req, file, callback) {
    //     callback(null, 'uploads/'); // Make sure this folder exists
    // },
    filename: function (req, file, callback){
        callback(null, file.originalname);  //callback is a function used to return the result to Multer
    }
});

const upload = multer({
    storage: storage,
});

export default upload;