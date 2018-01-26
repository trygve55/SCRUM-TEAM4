var imageCompressor = new ImageCompressor;

var compressorSettings = {
    toWidth : 300,
    toHeight : 300,
    mimeType : 'image/png',
    mode : 'strict',
    quality : 0.6,
    grayScale : true,
    sepia : true,
    threshold : 127,
    vReverse : true,
    hReverse : true,
    speed : 'low'
};

module.exports = {
	compress: function (imageSrc, cb) {
        imageCompressor.run(imageSrc, compressorSettings, cb);
	},
};