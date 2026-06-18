// updateOldOrders.js
import admin from "./config/firebase.js";

async function updateOldOrders() {
    try {
        const db = admin.firestore();
        
        // جلب جميع الطلبات القديمة
        const snapshot = await db.collection("spare_part_orders").get();
        
        console.log(`📦 Found ${snapshot.size} orders to check`);
        
        let updatedCount = 0;
        
        for (const doc of snapshot.docs) {
            const orderData = doc.data();
            
            // إذا كان الطلب ليس فيه customerName
            if (!orderData.customerName && orderData.customerId) {
                try {
                    // جلب اسم المستخدم من Firebase Auth
                    const userRecord = await admin.auth().getUser(orderData.customerId);
                    const customerName = userRecord.displayName || 
                                        userRecord.email?.split('@')[0] || 
                                        `User_${orderData.customerId.substring(0, 5)}`;
                    
                    // تحديث الطلب بإضافة الاسم
                    await db.collection("spare_part_orders").doc(doc.id).update({
                        customerName: customerName
                    });
                    
                    console.log(`✅ Updated order ${doc.id}: ${customerName}`);
                    updatedCount++;
                    
                } catch (userError) {
                    console.log(`❌ User not found for ${orderData.customerId}`);
                    // إضافة اسم افتراضي
                    await db.collection("spare_part_orders").doc(doc.id).update({
                        customerName: `User_${orderData.customerId.substring(0, 5)}`
                    });
                    updatedCount++;
                }
            }
        }
        
        console.log(`🎉 Done! Updated ${updatedCount} orders`);
        
    } catch (error) {
        console.error("Error updating orders:", error);
    }
}

// تشغيل الدالة
updateOldOrders();