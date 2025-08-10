// Script to update pricing plans in Firestore
const admin = require('firebase-admin');
const serviceAccount = require('../../coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function updatePricingPlans() {
  try {
    // Define the new pricing plans
    const pricingPlans = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for: New businesses testing digital coupons',
        price: 0,
        currency: 'ZAR',
        billingCycle: 'month',
        popularPlan: false,
        ctaText: 'Start for free',
        features: [
          {
            id: 'unlimited-creation',
            name: 'Unlimited coupon creation & sending',
            included: true,
            highlight: true
          },
          {
            id: 'basic-templates',
            name: 'Basic coupon templates',
            included: true
          },
          {
            id: 'qr-code',
            name: 'QR code generation',
            included: true
          },
          {
            id: 'social-sharing',
            name: 'Social media sharing',
            included: true
          },
          {
            id: 'basic-analytics',
            name: 'Basic analytics (views, shares)',
            included: true
          },
          {
            id: 'email-distribution',
            name: 'Email distribution',
            included: true
          },
          {
            id: 'coupon-redemption',
            name: 'Coupon redemption',
            included: false,
            highlight: true,
            tooltip: 'Upgrade required'
          },
          {
            id: 'advanced-analytics',
            name: 'Advanced analytics',
            included: false
          },
          {
            id: 'loyalty-programs',
            name: 'Loyalty programs',
            included: false
          }
        ],
        valueProposition: 'Create and share unlimited coupons. Upgrade only when customers start redeeming!'
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'Perfect for: Active businesses ready to drive sales',
        price: 199,
        currency: 'ZAR',
        billingCycle: 'month',
        popularPlan: true,
        ctaText: 'Start free trial',
        features: [
          {
            id: 'everything-starter',
            name: 'Everything in Starter',
            included: true
          },
          {
            id: 'unlimited-redemption',
            name: 'Unlimited coupon redemption',
            included: true,
            highlight: true,
            tooltip: 'Key differentiator'
          },
          {
            id: 'advanced-redemption',
            name: 'Advanced redemption analytics',
            included: true
          },
          {
            id: 'customer-insights',
            name: 'Customer insights & behavior tracking',
            included: true
          },
          {
            id: 'basic-loyalty',
            name: 'Basic loyalty programs (points/visits)',
            included: true
          },
          {
            id: 'sms-notifications',
            name: 'SMS notifications (50/month)',
            included: true
          },
          {
            id: 'priority-email',
            name: 'Priority email support',
            included: true
          },
          {
            id: 'custom-branding',
            name: 'Custom coupon branding',
            included: true
          }
        ],
        valueProposition: 'Start converting customers into sales. Pay only when you\'re ready to redeem!'
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'Perfect for: Established businesses with regular customers',
        price: 399,
        currency: 'ZAR',
        billingCycle: 'month',
        popularPlan: false,
        ctaText: 'Start free trial',
        features: [
          {
            id: 'everything-growth',
            name: 'Everything in Growth',
            included: true
          },
          {
            id: 'advanced-loyalty',
            name: 'Advanced loyalty programs (tiers, rewards)',
            included: true,
            highlight: true
          },
          {
            id: 'unlimited-messaging',
            name: 'Unlimited SMS/WhatsApp (1000+/month)',
            included: true
          },
          {
            id: 'advanced-segmentation',
            name: 'Advanced customer segmentation',
            included: true
          },
          {
            id: 'automated-campaigns',
            name: 'Automated marketing campaigns',
            included: true
          },
          {
            id: 'api-access',
            name: 'API access for integrations',
            included: true
          },
          {
            id: 'white-label',
            name: 'White-label branding',
            included: true
          },
          {
            id: 'dedicated-manager',
            name: 'Dedicated account manager',
            included: true
          },
          {
            id: 'advanced-reporting',
            name: 'Advanced reporting & exports',
            included: true
          }
        ],
        valueProposition: 'Automate customer retention and scale your marketing efforts.'
      }
    ];

    // Batch write to Firestore
    const batch = db.batch();
    
    // First delete existing plans
    const existingPlans = await db.collection('pricing_plans').get();
    existingPlans.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Then add new plans
    pricingPlans.forEach(plan => {
      const planRef = db.collection('pricing_plans').doc(plan.id);
      batch.set(planRef, plan);
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log('Successfully updated pricing plans!');
  } catch (error) {
    console.error('Error updating pricing plans:', error);
  }
}

updatePricingPlans()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });