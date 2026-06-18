import admin from "../config/firebase.js";

/* ===============================
⭐️ ADD RATING (معدل - يقبل تقييم بدون مهندس)
================================ */
export const addRating = async (req, res) => {
    try {
        const { engineerId, rating, comment } = req.body;
        const uid = req.user.uid;
        const db = admin.firestore();

        console.log('📥 Received rating request:', { engineerId, rating, comment, uid });

        // ✅ التحقق من وجود rating فقط (engineerId اختياري)
        if (rating === undefined || rating === null) {
            console.log('❌ Rating missing');
            return res.status(400).json({ message: "Rating is required" });
        }

        // جلب اسم المستخدم
        let customerName = "Customer";
        try {
            const userRecord = await admin.auth().getUser(uid);
            customerName = userRecord.displayName || 
                          userRecord.email?.split('@')[0] || 
                          uid.substring(0, 8);
            console.log('👤 User name:', customerName);
        } catch (err) {
            console.log('User not found:', err);
        }

        // ✅ حالة 1: تقييم التطبيق (بدون engineerId)
        if (!engineerId) {
            console.log('📱 App rating - saving to ratings collection');
            
            const docRef = await db.collection("ratings").add({
                customerId: uid,
                customerName: customerName,
                rating: Number(rating),
                comment: comment || "",
                type: "app_rating",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            
            console.log('✅ App rating saved with ID:', docRef.id);
            return res.status(201).json({ 
                message: "App rating added successfully",
                id: docRef.id 
            });
        }

        // ✅ حالة 2: تقييم مهندس (مع engineerId)
        console.log('👨‍🔧 Engineer rating - looking for engineer:', engineerId);
        
        const engineerRef = db.collection("engineers").doc(engineerId);
        const engineerSnap = await engineerRef.get();

        if (!engineerSnap.exists) {
            console.log('❌ Engineer not found:', engineerId);
            return res.status(404).json({ message: "Engineer not found" });
        }

        const engineerData = engineerSnap.data();
        console.log('✅ Engineer found:', engineerData.name);

        await db.collection("ratings").add({
            customerId: uid,
            customerName: customerName,
            engineerId: engineerId,
            engineerName: engineerData.name,
            rating: Number(rating),
            comment: comment || "",
            type: "engineer_rating",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // تحديث إحصائيات المهندس
        const newCount = (engineerData.ratingsCount || 0) + 1;
        const newAverage = ((engineerData.ratingAverage || 0) * (newCount - 1) + Number(rating)) / newCount;

        await engineerRef.update({
            ratingsCount: newCount,
            ratingAverage: Number(newAverage.toFixed(1)),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log('✅ Engineer rating saved and stats updated');
        return res.status(201).json({ message: "Engineer rating added" });

    } catch (error) {
        console.error('❌ Add rating error:', error);
        return res.status(500).json({ message: error.message });
    }
};

/* ===============================
📥 GET ALL RATINGS (ADMIN)
================================ */
export const getAllRatings = async (req, res) => {
    try {
        const db = admin.firestore();
        
        const snapshot = await db
            .collection("ratings")
            .orderBy("createdAt", "desc")
            .get();

        const ratings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(`Found ${ratings.length} ratings`);
        return res.json(ratings);

    } catch (error) {
        console.error('Error getting ratings:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

/* ===============================
📊 ENGINEER RATING
================================ */
export const getEngineerRatings = async (req, res) => {
    try {
        const { engineerId } = req.params;
        const db = admin.firestore();

        const doc = await db
            .collection("engineers")
            .doc(engineerId)
            .get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Engineer not found" });
        }

        const data = doc.data();

        return res.json({
            average: data.ratingAverage || 0,
            reviews: data.ratingsCount || 0,
        });

    } catch (error) {
        console.error('Error getting engineer ratings:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

/* ===============================
🚨 ADD COMPLAINT
================================ */
export const addComplaint = async (req, res) => {
    try {
        const { message, customerName } = req.body;
        const uid = req.user.uid;
        const db = admin.firestore();

        if (!message) {
            return res.status(400).json({ message: "Message required" });
        }

        let finalCustomerName = customerName;
        if (!finalCustomerName) {
            try {
                const userRecord = await admin.auth().getUser(uid);
                finalCustomerName = userRecord.displayName || 
                                  userRecord.email?.split('@')[0] || 
                                  uid.substring(0, 8);
            } catch (err) {
                finalCustomerName = uid.substring(0, 8);
            }
        }

        const docRef = await db.collection("complaints").add({
            customerId: uid,
            customerName: finalCustomerName,
            message: message,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(201).json({ 
            message: "Complaint added",
            complaint: {
                id: docRef.id,
                customerName: finalCustomerName,
                customerId: uid,
                message: message,
            }
        });

    } catch (error) {
        console.error('Error adding complaint:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

/* ===============================
📥 GET COMPLAINTS
================================ */
export const getAllComplaints = async (req, res) => {
    try {
        const db = admin.firestore();
        
        const snapshot = await db
            .collection("complaints")
            .orderBy("createdAt", "desc")
            .get();

        const complaints = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(`Found ${complaints.length} complaints`);
        return res.json(complaints);

    } catch (error) {
        console.error('Error getting complaints:', error);
        return res.status(500).json({ message: "Server error" });
    }
};
/* ===============================
📧 GET USER EMAIL (ADMIN)
================================ */
export const getUserEmail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "User ID required",
      });
    }

    const userRecord = await admin.auth().getUser(id);

    return res.status(200).json({
      email: userRecord.email,
    });

  } catch (error) {
    console.error("Get email error:", error);

    return res.status(500).json({
      message: "Failed to get email",
      error: error.message,
    });
  }
};