// controllers/appRatingController.js
import admin from "../config/firebase.js";

/**
 * ✅ إضافة تقييم للتطبيق
 */
export const addAppRating = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const uid = req.user.uid;
        const db = admin.firestore();

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // جلب اسم المستخدم
        let customerName = "Customer";
        try {
            const userRecord = await admin.auth().getUser(uid);
            customerName = userRecord.displayName || 
                          userRecord.email?.split('@')[0] || 
                          uid.substring(0, 8);
        } catch (err) {
            console.log("User not found:", err);
        }

        // حفظ التقييم في Collection منفصل
        const docRef = await db.collection("app_ratings").add({
            customerId: uid,
            customerName: customerName,
            rating: Number(rating),
            comment: comment || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // حساب متوسط التقييمات الجديد
        const ratingsSnapshot = await db.collection("app_ratings").get();
        let totalRating = 0;
        ratingsSnapshot.forEach(doc => {
            totalRating += doc.data().rating;
        });
        const averageRating = totalRating / ratingsSnapshot.size;

        // تحديث متوسط التقييم في وثيقة منفصلة
        const statsRef = db.collection("app_stats").doc("ratings");
        const statsDoc = await statsRef.get();
        
        if (statsDoc.exists) {
            await statsRef.update({
                averageRating: averageRating,
                totalRatings: ratingsSnapshot.size,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await statsRef.set({
                averageRating: averageRating,
                totalRatings: ratingsSnapshot.size,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        return res.status(201).json({ 
            message: "App rating added successfully",
            rating: {
                id: docRef.id,
                rating: Number(rating),
                customerName: customerName
            }
        });

    } catch (error) {
        console.error("Error adding app rating:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * 📥 جلب جميع تقييمات التطبيق
 */
export const getAllAppRatings = async (req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db
            .collection("app_ratings")
            .orderBy("createdAt", "desc")
            .get();

        const ratings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.status(200).json(ratings);

    } catch (error) {
        console.error("Error getting app ratings:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * 📊 جلب إحصائيات تقييمات التطبيق
 */
export const getAppRatingStats = async (req, res) => {
    try {
        const db = admin.firestore();
        const statsRef = db.collection("app_stats").doc("ratings");
        const statsDoc = await statsRef.get();

        if (statsDoc.exists) {
            return res.status(200).json(statsDoc.data());
        } else {
            return res.status(200).json({
                averageRating: 0,
                totalRatings: 0
            });
        }

    } catch (error) {
        console.error("Error getting app rating stats:", error);
        return res.status(500).json({ message: "Server error" });
    }
};