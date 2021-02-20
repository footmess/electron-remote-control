module.exports = {
    lintOnSave: true,
    chainWebpack: config => {
        config.target("electron-renderer");
    },
}