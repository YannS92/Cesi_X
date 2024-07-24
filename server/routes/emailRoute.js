const express = require("express");
const sendEmail = require("../utilities/mailer");
const user = require("../models/user");
const isAuth = require("../middleware/passport");
const emailRouter = express.Router();

emailRouter.post("/login", isAuth(), async (req, res) => {
  // authMiddleware
  const user = req.user;
  if (!user) {
    return res.status(400).json({ error: "Adresse email manquante" });
  }
  try {
    await sendEmail(
      user.email,
      "Connexion réussie",
      "Vous vous êtes connecté avec succès."
    );
    res.json({ message: "Email de connexion envoyé" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de connexion", error);
    res.status(500).json({ error: "Veuillez réessayer !!" });
  }
  //   const { user } = req.body;
  //   if (!user) {
  //     return res.status(400).json({ error: "Adresse email manquante" });
  //   }
  //   try {
  //     await sendEmail(
  //       user,
  //       "Connexion réussie",
  //       "Vous vous êtes connecté avec succès."
  //     );
  //     res.json({ message: "Email de connexion envoyé à " + user });
  //   } catch (error) {
  //     console.error("Erreur lors de l'envoi de l'email de connexion:", error);
  //     res.status(500).json({ error: "Let's try again budd" });
  //   }
});

emailRouter.post("/order", isAuth(), async (req, res) => {
  const user = req.user;
  await sendEmail(
    user.email,
    "Commande confirmée",
    "Votre commande a été confirmée."
  );
  res.json({ message: "Email de confirmation de commande envoyé" });
});

emailRouter.post("/notify", isAuth(), async (req, res) => {
  const user = req.user;
  setTimeout(async () => {
    await sendEmail(
      user.email,
      "Commande en cours",
      "Vous y êtes presque!! Veuillez terminer votre achat"
    );
  }, 300000);
  res.json({ message: "Notification de commande en cours programmée" });
});

emailRouter.post("/sendEmails", isAuth(), async (req, res) => {
  const subject = req.body.subject;
  const message = req.body.message;

  try {
    const users = await User.find({});
    for (const user of users) {
      await sendEmail(user.email, subject, message);
    }
    res.json({ message: "E-mails envoyés avec succès!" });
  } catch (error) {
    console.error("Erreur lors de l'envoi des e-mails:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi des e-mails." });
  }
});

emailRouter.post("/test-email", async (req, res) => {
  const { refemail } = req.body;

  try {
    if (!refemail) {
      return res
        .status(400)
        .json({ error: "Adresse email manquante dans la requête" });
    }
    await sendEmail(refemail, "Test d'envoi d'email");
    res.json({ message: "Email de test envoyé avec succès à " + refemail });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de test :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'envoi de l'email de test" });
  }
});

module.exports = emailRouter;
