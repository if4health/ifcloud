const router = require("express").Router();
const path = require("path");

const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require('fs');

router.use(fileUpload());

const FileUploadController = require('../controllers/FileUploadController');

router.get("/ifcloud/home", (req, res)=>{
    res.render('home', {
        API_URL: process.env.API_URL
      });
});

router.get("/ifcloud/file_upload", (req, res)=>{
    fs.readdir('./uploads_src', (err, files) => {
        if(err){
            console.log(err);
            return res.render('file_upload');
        }
        return res.render('file_upload', {files});
    })
});

router.get("/ifcloud/json_form", (req, res)=>{
    res.render('json_form');
});

router.get("/ifcloud/about", (req, res)=>{
    res.render('about');
});

router.get("/ifcloud/form_example", (req, res)=>{
    res.render('form_example', {req});
});

router.post("/ifcloud/uploader", FileUploadController.scriptUploader);

module.exports = router;