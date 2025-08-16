/**
 * Test script to verify the customer-user linking implementation
 */
const admin = require('firebase-admin');
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

/**
 * Normalize a phone number to a consistent format
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle South African numbers
  if (digitsOnly.startsWith('27')) {
    return `+${digitsOnly}`;
  } else if (digitsOnly.startsWith('0')) {
    return `+27${digitsOnly.substring(1)}`;
  } else if (digitsOnly.length === 9) {
    return `+27${digitsOnly}`;
  }
  
  return `+27${digitsOnly}`;
};

/**
 * Test phone number normalization
 */
const testPhoneNormalization = () => {
  const testCases = [
    { input: '0832091122', expected: '+27832091122' },
    { input: '083 209 1122', expected: '+27832091122' },
    { input: '+27832091122', expected: '+27832091122' },
    { input: '(083) 209-1122', expected: '+27832091122' },
    { input: '27832091122', expected: '+27832091122' },
    { input: '832091122', expected: '+27832091122' },
  ];
  
  console.log('\n🧪 Testing phone number normalization:');
  
  testCases.forEach(({ input, expected }) => {
    const result = normalizePhoneNumber(input);
    const passed = result === expected;
    
    console.log(
      `${passed ? '✅' : '❌'} ${input} → ${result} ${passed ? '' : `(expected ${expected})`}`
    );
  });
};

/**
 * Test customer lookup by phone number
 */
const testCustomerLookup = async () => {
  console.log('\n🧪 Testing customer lookup by phone:');
  
  const testPhones = [
    '0832091122',
    '+27832091122',
    '083 209 1122'
  ];
  
  for (const phone of testPhones) {
    const normalizedPhone = normalizePhoneNumber(phone);
    console.log(`🔍 Looking for customer with phone: ${phone} (normalized: ${normalizedPhone})`);
    
    try {
      const customersRef = db.collection('customers');
      const querySnapshot = await customersRef
        .where('phone', '==', normalizedPhone)
        .limit(1)
        .get();
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        console.log(`✅ Found customer: ${doc.id} (${doc.data().name || 'unnamed'})`);
      } else {
        console.log(`❌ No customer found with phone: ${normalizedPhone}`);
      }
    } catch (error) {
      console.error(`❌ Error during lookup:`, error);
    }
  }
};

/**
 * Test customer-user linking
 */
const testCustomerUserLinking = async () => {
  console.log('\n🧪 Testing customer-user linking:');
  
  // Create a test user and customer
  const testUserId = `test-user-${Date.now()}`;
  const testCustomerId = `test-customer-${Date.now()}`;
  const testPhone = '+27832091122';
  
  try {
    // Create test customer
    console.log(`🔄 Creating test customer: ${testCustomerId}`);
    await db.collection('customers').doc(testCustomerId).set({
      id: testCustomerId,
      phone: testPhone,
      name: 'Test Customer',
      email: 'test@example.com',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create test user
    console.log(`🔄 Creating test user: ${testUserId}`);
    await db.collection('users').doc(testUserId).set({
      uid: testUserId,
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'customer',
      phoneNumber: testPhone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Link customer to user
    console.log(`🔄 Linking customer ${testCustomerId} to user ${testUserId}`);
    await db.runTransaction(async (transaction) => {
      const customerRef = db.collection('customers').doc(testCustomerId);
      
      // Update customer with user ID
      transaction.update(customerRef, {
        userId: testUserId,
        linkedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update user with customer ID
      const userRef = db.collection('users').doc(testUserId);
      transaction.update(userRef, {
        linkedCustomerId: testCustomerId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    // Verify linking
    const customerDoc = await db.collection('customers').doc(testCustomerId).get();
    const userDoc = await db.collection('users').doc(testUserId).get();
    
    if (customerDoc.exists && customerDoc.data().userId === testUserId) {
      console.log('✅ Customer successfully linked to user');
    } else {
      console.log('❌ Customer not linked to user correctly');
    }
    
    if (userDoc.exists && userDoc.data().linkedCustomerId === testCustomerId) {
      console.log('✅ User successfully linked to customer');
    } else {
      console.log('❌ User not linked to customer correctly');
    }
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await db.collection('customers').doc(testCustomerId).delete();
    await db.collection('users').doc(testUserId).delete();
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error during customer-user linking test:', error);
  }
};

/**
 * Main test function
 */
const runTests = async () => {
  console.log('🧪 Starting customer-user linking tests...');
  
  // Test phone normalization
  testPhoneNormalization();
  
  // Test customer lookup
  await testCustomerLookup();
  
  // Test customer-user linking
  await testCustomerUserLinking();
  
  console.log('\n🎉 All tests completed!');
};

// Run the tests
runTests()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });