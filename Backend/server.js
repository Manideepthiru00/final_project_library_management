import app from "./app.js";
import cloudinary from "cloudinary";

import { notifyUsersCron } from "./services/notifyUsers.js";
import { removeUnverifiedAccountsCron } from "./services/removeUnverifiedAccounts.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

notifyUsersCron();
removeUnverifiedAccountsCron();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
