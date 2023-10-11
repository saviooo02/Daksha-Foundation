const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejsMate = require("ejs-mate");
const dbURL =
  "mongodb+srv://savioshaji:4cTemN5s8GrBxp0M@cluster0.g0y206b.mongodb.net/";
const Applicant = require("./models/applicant");
const Volunteer = require("./models/volunteer");
const Volcred = require("./models/volcred");
const Capplicant = require("./models/capplicant");
const Report = require("./models/report");
const Center = require("./models/center");
const Admin = require("./models/admin");
const Photo = require("./models/photo");
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require("nodemailer");
const multer = require("multer");
const methodOverride = require("method-override");
const volunteer = require("./models/volunteer");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(dbURL, connectionParams)
  .then(() => {
    console.log("connection successfull muthus");
  })
  .catch((e) => {
    console.log(e);
  });

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/public/images/", express.static("./public/images"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "notagoodsecret" }));
app.use(methodOverride("_method"));

const requireLogin = (req, res, next) => {
  if (!req.session.admin_id) {
    return res.redirect("/login");
  }
  next();
};

const isLoggedin = (req, res, next) => {
  if (!req.session.volcred_id) {
    return res.redirect("/login");
  }
  next();
};

app.listen(3000, () => {
  console.log("Listening to port 3000");
});

app.get("/", (req, res) => {
  res.render("home");
});

// volunteer application submission
app.get("/volApplication", async (req, res) => {
  try {
    const centers = await Center.find();
    res.render("volunteerappli", { centers }); // Pass centers to the EJS template
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Keep the file extension
    const fileExtension = file.originalname.split(".").pop();
    cb(null, uniqueSuffix + "." + fileExtension);
  },
});

// Create an instance of the multer middleware with the storage configuration
const uploadVol = multer({ storage: storage }).single("image");

app.post("/volApplication", (req, res) => {
  // Handle the image upload
  uploadVol(req, res, function (err) {
    if (err) {
      // Handle the error
      console.error(err);
    }

    // Access the uploaded image details
    const imageFile = req.file;

    if (!imageFile) {
      // Show an alert message or handle the error as desired
      return res.send(
        '<script>alert("Image field is empty."); window.history.back();</script>'
      );
    }

    // Create a new instance of the Applicant model with all form data
    let newApplicant = new Applicant({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      age: req.body.age,
      dobFormatted: req.body.dobFormatted,
      gender: req.body.gender,
      aadhar: req.body.aadhar,
      phno: req.body.phno,
      address: req.body.address,
      dayPreference: req.body.dayPreference,
      categories: req.body.categories,
      email: req.body.email,
      center: req.body.center,
      image: imageFile.filename, // Save the filename or path of the uploaded image
    });

    // Save the new applicant to the database
    newApplicant
      .save()
      .then(() => {
        res.redirect("/");
      })
      .catch((error) => {
        // Handle the error
        console.error(error);
        res.redirect("/");
      });
  });
});

// Center application submission
app.get("/centerappli", (req, res) => {
  res.render("centerappli");
});

const uploadCenter = multer({ storage: storage }).array("photos", 3);

app.post("/centerappli", (req, res) => {
  // Handle the image upload
  uploadCenter(req, res, function (err) {
    if (err) {
      // Handle the error
      console.error(err);
    }

    // Access the uploaded photos' details
    const photoFiles = req.files;

    // Create a new instance of the CenterApplication model with all form data
    let newCapplicant = new Capplicant({
      fullname: req.body.fullname,
      address: req.body.address,
      phno: req.body.phno,
      email: req.body.email,
      type: req.body.type,
      caddress: req.body.caddress,
      cdistrict: req.body.cdistrict,
      cpanchayath: req.body.cpanchayath,
      cpincode: req.body.cpincode,
      buildingno: req.body.buildingno,
      // Add more fields from the form as needed

      photos: photoFiles.map((file) => file.filename), // Save the filenames or paths of the uploaded photos
    });

    // Save the new center application to the database
    newCapplicant
      .save()
      .then(() => {
        res.redirect("/");
      })
      .catch((error) => {
        // Handle the error
        console.error(error);
        res.redirect("/");
      });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

//admin login shit

app.get("/login/admin", (req, res) => {
  res.render("loginadmin");
});

app.post("/login/admin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username: username });
    if (!admin) {
      return res.send("Username was not found!");
    }
    const validPassword = await bcrypt.compare(password, admin.password);
    if (validPassword) {
      req.session.admin_id = admin._id;
      res.redirect("/admin/dashboard");
    } else {
      res.send("Invalid password/username Please try again.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred while processing the request.");
  }
});

//volunteer login shit

app.get("/login/volunteer", (req, res) => {
  res.render("loginvolunteer");
});

app.post("/login/volunteer", async (req, res) => {
  const { username, password } = req.body;
  try {
    const volcred = await Volcred.findOne({ username: username });
    if (!volcred) {
      return res.send("Username was not found!");
    }
    const validPassword = await bcrypt.compare(password, volcred.password);
    if (validPassword) {
      req.session.volcred_id = volcred._id;
      res.redirect("/volunteer/dashboard");
    } else {
      res.send("Invalid password/username Please try again.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred while processing the request.");
  }
});

app.get("/volunteer/dashboard", isLoggedin, (req, res) => {
  res.render("volunteerdashboard");
});

app.get("/admin/dashboard", requireLogin, async (req, res) => {
  const applicants = await Applicant.find({});
  const capplicants = await Capplicant.find({});
  res.render("admindashboard", { applicants, capplicants });
});

app.post("/logout", (req, res) => {
  req.session.admin_id = null;
  res.redirect("/");
});

//admin dashboard shit/view applicants(1st function)

app.get("/admin/dashboard/:id", requireLogin, async (req, res) => {
  const applicant = await Applicant.findById(req.params.id);
  const capplicant = await Capplicant.findById(req.params.id);
  res.render("showApplicant", { applicant, capplicant });
});

//accept or reject volunteers
app.post("/admin/dashboard/:id/move", requireLogin, async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    // Create a new Volunteer document with the applicant data
    const shortId = generateShortId();

    const volunteer = new Volunteer({
      firstname: applicant.firstname,
      lastname: applicant.lastname,
      age: applicant.age,
      dobFormatted: applicant.dateFormatted,
      gender: applicant.gender,
      aadhar: applicant.aadhar,
      phno: applicant.phno,
      address: applicant.address,
      dayPreference: applicant.dayPreference,
      categories: applicant.categories,
      email: applicant.email,
      center: applicant.center,
      image: applicant.image,
      shortId: shortId,
    });
    // Save the new volunteer document
    await volunteer.save();
    // Remove the applicant document from the Applicant collection
    await Applicant.findByIdAndRemove(req.params.id);
    res.redirect("/admin/dashboard"); // Redirect to the dashboard or any other page
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

function generateShortId(length = 4) {
  const randomNumber = Math.floor(Math.random() * 9000) + 1000; // Generate a random 4-digit number
  const shortId = `DF${randomNumber}`;
  return shortId;
}

app.post("/admin/dashboard/:id/delete", requireLogin, async (req, res) => {
  try {
    await Applicant.findByIdAndRemove(req.params.id);
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// to display center applicants

app.get("/admin/dashboard/center/:id", requireLogin, async (req, res) => {
  const capplicant = await Capplicant.findById(req.params.id);
  res.render("showCapplicant", { capplicant });
});

//accept or reject centers
app.post("/admin/dashboard/center/:id/move", requireLogin, async (req, res) => {
  try {
    const capplicant = await Capplicant.findById(req.params.id);

    const shortId2 = generateShortId2();

    // Copy the uploaded images from capplicant to center
    const photos = [];
    for (const photo of capplicant.photos) {
      const newPhoto = new Photo({ filename: photo });
      await newPhoto.save();
      photos.push(`${newPhoto._id}${path.extname(photo)}`); // Include file extension
    }

    const center = new Center({
      fullname: capplicant.fullname,
      address: capplicant.address,
      phno: capplicant.phno,
      email: capplicant.email,
      type: capplicant.type,
      caddress: capplicant.caddress,
      cdistrict: capplicant.cdistrict,
      cpanchayath: capplicant.cpanchayath,
      cpincode: capplicant.cpincode,
      buildingno: capplicant.buildingno,
      photos: photos,
      shortId2: shortId2,
    });

    await center.save();
    await Capplicant.findByIdAndRemove(req.params.id);
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

function generateShortId2(length = 4) {
  const randomNumber = Math.floor(Math.random() * 9000) + 1000; // Generate a random 4-digit number
  const shortId2 = `DF${randomNumber}`;
  return shortId2;
}

app.post(
  "/admin/dashboard/center/:id/delete",
  requireLogin,
  async (req, res) => {
    try {
      await Capplicant.findByIdAndRemove(req.params.id);
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

//manage volunteers (2nd function)
app.get("/admin/managevol", requireLogin, async (req, res) => {
  const volunteer = await Volunteer.find({});
  res.render("managevol", { volunteer });
});

app.get("/admin/managevol/:id", requireLogin, async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  res.render("showVolunteer", { volunteer });
});

app.get("/admin/managevol/:id/update", requireLogin, async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  res.render("updateVolunteer", { volunteer });
});

app.post("/admin/managevol/:id/update", requireLogin, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    // Update the volunteer document with the new data
    volunteer.firstname = req.body.firstname;
    volunteer.lastname = req.body.lastname;
    volunteer.age = req.body.age;
    volunteer.dobFormatted = req.body.dobFormatted;
    volunteer.gender = req.body.gender;
    volunteer.aadhar = req.body.aadhar;
    volunteer.phno = req.body.phno;
    volunteer.address = req.body.address;
    volunteer.dayPreference = req.body.dayPreference;
    volunteer.categories = req.body.categories;
    volunteer.email = req.body.email;
    volunteer.center = req.body.center;

    // Save the updated volunteer document
    await volunteer.save();

    res.redirect("/admin/managevol/" + req.params.id);
  } catch (error) {
    console.error(error);
    res.redirect("/admin/managevol/" + req.params.id);
  }
});

// Delete Volunteer Route
app.post("/admin/managevol/:id/delete", requireLogin, async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.redirect("/admin/managevol");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/managevol");
  }
});

//register volunteers (3rd function)
app.get("/admin/register", requireLogin, async (req, res) => {
  try {
    const vols = await Volunteer.find();
    const volcred = await Volcred.find();
    res.render("register", { vols, volcred }); // Pass volunteers to the EJS template
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/admin/register", requireLogin, async (req, res) => {
  try {
    const { password, username, volid } = req.body;
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    const volcred = new Volcred({
      username,
      password: hash,
      volid,
    });
    await volcred.save();
    res.redirect("/admin/register");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete route for handling delete request
app.delete("/admin/register/:id", requireLogin, async (req, res) => {
  try {
    const volcredId = req.params.id;
    // Delete the volcred document with the provided ID from the collection
    await Volcred.findByIdAndDelete(volcredId);
    res.redirect("/admin/register");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
//manage centers (4th function)
app.get("/admin/managecenter", requireLogin, async (req, res) => {
  const center = await Center.find({});
  res.render("managecenter", { center });
});

app.get("/admin/managecenter/:id", requireLogin, async (req, res) => {
  const center = await Center.findById(req.params.id);
  res.render("showCenter", { center });
});

app.get("/admin/managecenter/:id/update", requireLogin, async (req, res) => {
  const center = await Center.findById(req.params.id);
  res.render("updateCenter", { center });
});

app.post("/admin/managecenter/:id/update", requireLogin, async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);

    // Update the center document with the new data
    center.caddress = req.body.caddress;
    center.cdistrict = req.body.cdistrict;
    center.cpanchayath = req.body.cpanchayath;
    center.cpincode = req.body.cpincode;
    center.buildingno = req.body.buildingno;
    center.fullname = req.body.fullname;
    center.address = req.body.address;
    center.phno = req.body.phno;
    center.email = req.body.email;
    center.type = req.body.type;

    // Save the updated center document
    await center.save();

    res.redirect("/admin/managecenter/" + req.params.id);
  } catch (error) {
    console.error(error);
    res.redirect("/admin/managecenter/" + req.params.id);
  }
});

// Delete Center Route
app.post("/admin/managecenter/:id/delete", requireLogin, async (req, res) => {
  try {
    await Center.findByIdAndDelete(req.params.id);
    res.redirect("/admin/managecenter");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/managecenter");
  }
});

//view reports (5th function)
app.get("/admin/viewreport", requireLogin, async (req, res) => {
  const report = await Report.find({});
  res.render("showReportadmin", { report });
});

app.get("/admin/viewreport/:id", requireLogin, async (req, res) => {
  const report = await Report.findById(req.params.id);
  res.render("eachReport", { report });
});

app.post("/admin/viewreport/:id/delete", requireLogin, async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.redirect("/admin/viewreport");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/viewreport");
  }
});

//send mail

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "dakshafoundation7@gmail.com", // admin email address
    pass: "fztgcwsjgztxeoxd",
  },
});

app.get("/admin/sendmail", requireLogin, async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.render("mail", { volunteers }); // Pass centers to the EJS template
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/admin/sendmail", requireLogin, (req, res) => {
  const { recipient, subject, body } = req.body;

  const mailOptions = {
    from: "dakshafoundation7@gmail.com", // admin email address
    to: recipient,
    subject: subject,
    text: body,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).json({ message: "Error sending email" });
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
});

//volunteer dashboard function
//1st function (create reports)

app.get("/volunteer/createreport", isLoggedin, async (req, res) => {
  const centers = await Center.find();
  const volunteers = await Volunteer.find();
  res.render("report", { centers, volunteers });
});

app.post("/volunteer/createreport", isLoggedin, (req, res) => {
  let newReport = new Report({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    hours: req.body.hours,
    volunteer: req.body.volunteer,
    center: req.body.center,
    category: req.body.category,
  });
  newReport.save();
  res.redirect("/volunteer/createreport");
});

//2nd function

app.get("/volunteer/viewreport", isLoggedin, async (req, res) => {
  const report = await Report.find({});
  res.render("showReport-vol", { report });
});

app.get("/volunteer/viewreport/:id", isLoggedin, async (req, res) => {
  const report = await Report.findById(req.params.id);
  res.render("eachReport-vol", { report });
});

//4cTemN5s8GrBxp0M
