import admin from "../config/firebase.js";

export const getEngineers = async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("engineers").get();

    const engineers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(engineers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createEngineer = async (req, res) => {
  try {
    const { name, role } = req.body;

    const docRef = await admin.firestore().collection("engineers").add({
      name,
      role,
      createdAt: new Date().toISOString(),
    });

    res.json({ id: docRef.id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateEngineer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    await admin.firestore().collection("engineers").doc(id).update({
      name,
      role,
    });

    res.json({ message: "Updated" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteEngineer = async (req, res) => {
  try {
    await admin.firestore().collection("engineers").doc(req.params.id).delete();
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};