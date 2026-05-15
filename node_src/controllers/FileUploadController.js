const path = require("path");
const fs = require("fs");

class FileUploaderController{
    async scriptUploader(req, res){
        return res.status(503).json({
            message: "Script uploads are temporarily disabled"
        });

        try{
            var script = req.files.script;
            var scriptName = script.name;
            var scriptExtName = path.extname(scriptName.toLowerCase());
            var filetype = /.py/;
 
            const msg = { text: "|o| Sucessfull Upload |o|" };

            if (!filetype.test(scriptExtName)) {
                msg.text = "Error: File upload only supports the following filetypes - " +filetype;
                fs.readdir('./uploads_src', (err, files) => {
                    if(err){
                        return res.render('server_files', {msg});
                    }
                    return res.render('server_files', {files, msg});
                })
                return;
            }

            if(fs.existsSync("./uploads_src/"+scriptName)){
                scriptName = Date.now().toString()+""+scriptName;
            }

            script.mv("./uploads_src/"+scriptName);

            fs.readdir('./uploads_src', (err, files) => {
                if(err){
                    return res.render('server_files', {msg});
                }
                return res.render('server_files', {files, msg});
            });
        }catch(e){
            console.log(e);
            return res.status(e.statusCode || 500).json(e.message);
        }
    }
}

module.exports = new FileUploaderController();