const router = require("express").Router();
const path = require("path");

const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require('fs');

router.use(fileUpload());

const FileUploadController = require('../controllers/FileUploadController');

router.get("/home", (req, res)=>{
    res.render('home');
});

router.get("/file_upload", (req, res)=>{
    fs.readdir('./uploads_src', (err, files) => {
        if(err){
            console.log(err);
            return res.render('file_upload');
        }

        // Filtra apenas os arquivos .py
        const pyFiles = files.filter(file => path.extname(file) === '.py');
        return res.render('file_upload', { files: pyFiles });
    })
});

router.get("/json_form", (req, res)=>{
    res.render('json_form');
});

router.get("/about", (req, res)=>{
    res.render('about');
});

router.get("/form_example", (req, res)=>{
    res.render('form_example', {req});
});

router.post("/uploader", FileUploadController.scriptUploader);

module.exports = router;