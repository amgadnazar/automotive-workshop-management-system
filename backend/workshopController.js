import { db } from '../config/firebase.js';

/* =================================
📥 GET WORKSHOP INFO
================================= */
export const getWorkshopInfo = async (req, res) => {
try {
    const doc = await db.collection('workshop').doc('info').get();

    if (!doc.exists) {
    return res.status(404).json({
        message: 'Workshop info not found',
    });
    }

    return res.status(200).json(doc.data());

} catch (error) {
    return res.status(500).json({
    message: error.message,
    });
}
};

/* =================================
♻️ UPSERT WORKSHOP (CREATE OR UPDATE)
================================= */
export const updateWorkshopInfo = async (req, res) => {
try {
    const docRef = db.collection('workshop').doc('info');

    await docRef.set(
    {
        ...req.body,
        updatedAt: new Date().toISOString(),
    },
      { merge: true } // 🔥 أهم سطر
    );

    return res.status(200).json({
    message: 'Workshop saved successfully',
    });

} catch (error) {
    return res.status(500).json({
    message: error.message,
    });
}
};