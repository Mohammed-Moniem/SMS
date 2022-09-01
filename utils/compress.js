const compress_images = require("compress-images");
const fs = require("fs");

const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const messages = require("../helpers/messages");

exports.compress = asyncHandler(async (base64Avatar, imageExtension) => {
  let base64Data = base64Avatar.replace(/^data:image\/png;base64,/, "");

  fs.writeFile(
    `./compress/out.${imageExtension}`,
    base64Data,
    "base64",
    (err) => {
      console.log(err);
      return next(
        new ErrorResponse(`${messages.authMessages.compressionAr}`, 400)
      );
    }
  );

  compress_images(
    `./compress/out.${imageExtension}`,
    `./compress/new-`,
    { compress_force: false, statistic: true, autoupdate: true },
    false,
    { jpg: { engine: "mozjpeg", command: ["-quality", "30"] } },
    { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
    { svg: { engine: "svgo", command: "--multipass" } },
    {
      gif: {
        engine: "gifsicle",
        command: ["--colors", "64", "--use-col=web"],
      },
    },
    (error, completed, statistic) => {
      console.log("-------------");
      console.log(error);
      console.log(completed);
      console.log(statistic);
      console.log("-------------");
      return next(
        new ErrorResponse(`${messages.authMessages.compressionAr}`, 400)
      );
    }
  );

  const compressedBase64 = fs.readFileSync(
    `./compress/new-out.${imageExtension}`,
    {
      encoding: "base64",
    }
  );

  fs.unlinkSync(`./compress/out.${imageExtension}`);
  fs.unlinkSync(`./compress/new-out.${imageExtension}`);

  return compressedBase64;
});
