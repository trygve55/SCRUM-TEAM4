var router = require('express').Router(),
    formidable = require('formidable'),
    Jimp = require("jimp");

module.exports = router;

router.post('/', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var path = files.file.path,
            file_size = files.file.size;
        if (file_size > 2000000)
            return res.status(400).json({'error': 'image file over 2MB'});
        Jimp.read(path, function (err, img) {
            if (err) {
                res.status(500).json({'Error': err});
                return;
            }
            var img_tiny = img.clone();
            img.scaleToFit(2000, 1500)
                .quality(70)
                .getBuffer(Jimp.MIME_JPEG, function (err, data) {
                    if (err) {
                        res.status(500).json({'Error': err});
                        return;
                    }
                    img_tiny.cover(128, 128)
                        .quality(60)
                        .getBuffer(Jimp.MIME_JPEG, function (err, data_tiny) {
                            if (err) {
                                res.status(500).json({'Error': err});
                                return;
                            }
                                pool.query("UPDATE person SET profile_pic = ?, profile_pic_tiny = ? WHERE person_id = 1;", [data, data_tiny], function (err, results, fields) {
                                    if (err) {
                                        return res.status(500).json({'Error': err});
                                    }
                                    res.status(200).json(results);
                                });
                            });
                        });
                });
        });
});

router.get('/', function(req, res) {
    pool.query("SELECT profile_pic FROM person WHERE person_id = 1;", [], function (error, results, fields) {
        if(err) return res.status(500).json({error:err});

        if(results.length) res.status(404).json({error: 'no profile picture.'});

        if(results) res.contentType('jpeg').status(200).end(results[0].profile_pic, 'binary');
    });
});

router.get('/tiny', function(req, res) {
    pool.query("SELECT profile_pic_tiny FROM person WHERE person_id = 1;", [], function (error, results, fields) {
        if(err) {
            res.status(500).json({'Error' : 'connecting to database: ' } + err);
            return;
        }

        if(results.length) res.status(404).json({error: 'no profile picture.'});

        if(results) res.contentType('jpeg').status(200).end(results[0].profile_pic, 'binary');
    });
});
