const openAboutWindow = require("about-window").default;
const path = require("path");

const create = () =>
  openAboutWindow({
    icon_path: path.join(__dirname, "/assets/dog.png"),
    package_json_dir: path.join(__dirname, "../package.json"),
    copyright: "Copyright (c) 2021 lyj",
    homepage: "https://github.com/footmess/electron-remote-control"
  });

module.exports = { create };
