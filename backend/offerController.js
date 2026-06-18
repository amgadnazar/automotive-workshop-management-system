import admin from "../config/firebase.js";

export const getOffers = async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("offers").get();

    const offers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(offers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createOffer = async (req, res) => {
  try {
    const { title, description } = req.body;

    const docRef = await admin.firestore().collection("offers").add({
      title,
      description,
      createdAt: new Date().toISOString(),
    });

    res.json({ id: docRef.id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    await admin.firestore().collection("offers").doc(id).update({
      title,
      description,
    });

    res.json({ message: "Updated" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    await admin.firestore().collection("offers").doc(req.params.id).delete();
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};