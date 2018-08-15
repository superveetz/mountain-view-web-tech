module.exports = function() {
    return function forceClientSideRouting(err, req, res, next) {
        return res.render(path.resolve(__dirname, '../../client/dist/index.html'))
    };
};