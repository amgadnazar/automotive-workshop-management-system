// updateCustomerNames.js
import admin from "./config/firebase.js";

async function updateAllOrders() {
    try {
        const db = admin.firestore();
        
        // جلب جميع الطلبات
        const snapshot = await db.collection("spare_part_orders").get();
        
        console.log(`📦 Found ${snapshot.size} orders to update...`);
        
        let updated = 0;
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const customerId = data.customerId;
            
            if (customerId && (customerId === data.customerName || !data.customerName)) {
                try {
                    // جلب اسم المستخدم الحقيقي من Firebase Auth
                    const userRecord = await admin.auth().getUser(customerId);
                    
                    // تحديد الاسم المناسب
                    let realName = userRecord.displayName;
                    if (!realName && userRecord.email) {
                        realName = userRecord.email.split('@')[0];
                    }
                    if (!realName) {
                        realName = `Customer_${customerId.substring(0, 5)}`;
                    }
                    
                    // تحديث الطلب بالاسم الحقيقي
                    await doc.ref.update({
                        customerName: realName
                    });
                    
                    console.log(`✅ Updated: ${customerId.substring(0, 10)}... → ${realName}`);
                    updated++;
                    
                } catch (userError) {
                    console.log(`❌ User not found: ${customerId}`);
                    // إضافة اسم مؤقت
                    await doc.ref.update({
                        customerName: `User_${customerId.substring(0, 5)}`
                    });
                    updated++;
                }
            }
        }
        
        console.log(`\n🎉 Done! Updated ${updated} orders.`);
        
    } catch (error) {
        console.error("Error:", error);
    }
}

updateAllOrders();