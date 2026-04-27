import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedCosts() {
  const snapshot = await getDocs(collection(db, 'gc_franchises'));
  const franchises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log(`Found ${franchises.length} franchises.`);
  
  for (const f of franchises) {
    const sqft = 2500;
    const siteWork = 250000;
    const buildingShell = 500000;
    const interior = 300000;
    const softCosts = 150000;
    const ffe = 100000;
    const contingency = 100000;
    const totalCost = siteWork + buildingShell + interior + softCosts + ffe + contingency;

    await addDoc(collection(db, 'gc_construction_costs'), {
      franchiseId: f.id,
      buildingSizeSqFt: sqft,
      siteWork,
      buildingShell,
      interiorBuildout: interior,
      softCosts,
      ffAndE: ffe,
      contingency,
      totalCost,
      dateAdded: new Date().toISOString()
    });
    console.log(`Added cost for ${f.name}`);
  }
  console.log('Done!');
}

seedCosts();
