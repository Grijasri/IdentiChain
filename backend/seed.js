const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Document = require('./models/Document');
const Triage = require('./models/Triage');
const AidRequest = require('./models/AidRequest');
const Transaction = require('./models/Transaction');
const { generateFileHash, generateTxHash } = require('./services/hashService');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper to create sample file in uploads
const createDummyFile = (filename, content) => {
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
};

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Document.deleteMany({});
    await Triage.deleteMany({});
    await AidRequest.deleteMany({});
    await Transaction.deleteMany({});

    console.log('Generating password hashes...');
    const salt = await bcrypt.genSalt(10);
    const refugeePassword = await bcrypt.hash('refugee123', salt);
    const verifierPassword = await bcrypt.hash('verifier123', salt);

    // 1. Create Verifier Accounts
    console.log('Seeding Verifier & NGO accounts...');
    const verifiers = [
      {
        name: 'Dr. Olena Kovalenko (UNHCR Clinic)',
        email: 'verifier.clinic@identichain.org',
        password: verifierPassword,
        role: 'verifier',
        digitalId: 'IDC-VERIFIER-CLINIC-01',
        organization: 'UNHCR Poland Border Health Clinic',
        verifierType: 'clinic',
        countryOfOrigin: 'Ukraine',
        currentLocation: 'Krakow, Poland',
      },
      {
        name: 'Jan Nowak (PKO Bank Relief)',
        email: 'verifier.bank@identichain.org',
        password: verifierPassword,
        role: 'verifier',
        digitalId: 'IDC-VERIFIER-BANK-02',
        organization: 'PKO Bank Polski Humanitarian Integration Unit',
        verifierType: 'bank',
        countryOfOrigin: 'Poland',
        currentLocation: 'Warsaw, Poland',
      },
      {
        name: 'Anna Schmidt (German Red Cross)',
        email: 'verifier.ngo@identichain.org',
        password: verifierPassword,
        role: 'verifier',
        digitalId: 'IDC-VERIFIER-NGO-03',
        organization: 'German Red Cross Displacement Support Desk',
        verifierType: 'ngo',
        countryOfOrigin: 'Germany',
        currentLocation: 'Berlin, Germany',
      },
    ];

    for (let v of verifiers) {
      v.qrCodeUrl = await QRCode.toDataURL(JSON.stringify({ digitalId: v.digitalId, organization: v.organization }));
      await new User(v).save();
    }

    // 2. Create Demo Refugee Users
    console.log('Seeding Refugee accounts with Digital IDs & QR Codes...');
    const refugeeData = [
      {
        name: 'Oksana Petrenko',
        email: 'oksana@identichain.org',
        password: refugeePassword,
        role: 'refugee',
        digitalId: 'IDC-8F92-4A71-9B3E',
        countryOfOrigin: 'Ukraine (Kyiv)',
        currentLocation: 'Warsaw, Poland',
      },
      {
        name: 'Mykhailo Shevchenko',
        email: 'mykhailo@identichain.org',
        password: refugeePassword,
        role: 'refugee',
        digitalId: 'IDC-73B1-92F0-4C11',
        countryOfOrigin: 'Ukraine (Kharkiv)',
        currentLocation: 'Krakow, Poland',
      },
      {
        name: 'Iryna Boyko',
        email: 'iryna@identichain.org',
        password: refugeePassword,
        role: 'refugee',
        digitalId: 'IDC-54E9-21D8-8A47',
        countryOfOrigin: 'Ukraine (Mariupol)',
        currentLocation: 'Berlin, Germany',
      },
      {
        name: 'Taras Bondarenko',
        email: 'taras@identichain.org',
        password: refugeePassword,
        role: 'refugee',
        digitalId: 'IDC-90A4-38C7-1F62',
        countryOfOrigin: 'Ukraine (Odessa)',
        currentLocation: 'Bucharest, Romania',
      },
      {
        name: 'Svitlana Moroz',
        email: 'svitlana@identichain.org',
        password: refugeePassword,
        role: 'refugee',
        digitalId: 'IDC-33F2-81B9-6D50',
        countryOfOrigin: 'Ukraine (Chernihiv)',
        currentLocation: 'Prague, Czechia',
      },
    ];

    const seededRefugees = [];
    for (let r of refugeeData) {
      r.qrCodeUrl = await QRCode.toDataURL(JSON.stringify({
        digitalId: r.digitalId,
        name: r.name,
        countryOfOrigin: r.countryOfOrigin,
        issuer: 'IdentiChain Global Ledger',
      }));
      const u = new User(r);
      await u.save();
      seededRefugees.push(u);
    }

    // 3. Seed Vault Documents with SHA-256 Hashes
    console.log('Seeding Multi-Category Documents with Cryptographic Hashes...');

    const docTemplates = [
      {
        refugeeIndex: 0, // Oksana
        docs: [
          {
            title: 'Biometric Ukrainian Passport',
            category: 'identity',
            filename: 'oksana_passport_biometric.pdf',
            content: 'BIOMETRIC PASSPORT - UKRAINE - OKSANA PETRENKO - ISSUED KYIV 2021',
            isShareable: true,
            aiTags: ['Biometric Identity', 'Verified Passport', 'Kyiv Issued'],
          },
          {
            title: 'Asthma Treatment Prescription & Medical History',
            category: 'medical',
            filename: 'oksana_medical_prescription_salbutamol.pdf',
            content: 'CLINICAL MEDICAL RECORD: OKSANA PETRENKO. DIAGNOSIS: ASTHMA. PRESCRIPTION: SALBUTAMOL INHALER 100MCG.',
            isShareable: true,
            aiTags: ['Medical Record', 'Prescription', 'Respiratory Care'],
          },
          {
            title: 'National Birth Certificate',
            category: 'identity',
            filename: 'oksana_birth_certificate.pdf',
            content: 'NATIONAL BIRTH CERTIFICATE - OKSANA PETRENKO - BORN KYIV 1994',
            isShareable: false, // Private document example!
            aiTags: ['Birth Certificate', 'Civil Status', 'Private Record'],
          },
          {
            title: 'Bachelor of Computer Science Diploma (Taras Shevchenko University)',
            category: 'education_property',
            filename: 'oksana_university_degree_cs.pdf',
            content: 'TARAS SHEVCHENKO NATIONAL UNIVERSITY OF KYIV - DIPLOMA OF BACHELOR IN COMPUTER SCIENCE - GRADUATED 2016',
            isShareable: true,
            aiTags: ['University Degree', 'Computer Science', 'Certified Qualification'],
          },
        ],
      },
      {
        refugeeIndex: 1, // Mykhailo
        docs: [
          {
            title: 'National Identity Card (Diia Verified Copy)',
            category: 'identity',
            filename: 'mykhailo_national_id_card.pdf',
            content: 'REPUBLIC OF UKRAINE NATIONAL ID CARD - MYKHAILO SHEVCHENKO - ID #84920492',
            isShareable: true,
            aiTags: ['National ID', 'Diia Interoperable', 'Biometric'],
          },
          {
            title: 'COVID-19 & Tetanus Vaccination Record',
            category: 'medical',
            filename: 'mykhailo_vaccination_certificate.pdf',
            content: 'INTERNATIONAL VACCINATION RECORD: MYKHAILO SHEVCHENKO. COVID-19 mRNA Pfizer (3 Doses), Tetanus Booster 2022.',
            isShareable: true,
            aiTags: ['Vaccination History', 'Immunization', 'WHO Compliant'],
          },
          {
            title: 'Kharkiv Residential Apartment Property Deed',
            category: 'education_property',
            filename: 'mykhailo_kharkiv_property_deed.pdf',
            content: 'PROPERTY TITLE & LAND REGISTRY DEED: APARTMENT 42, KHARKIV CENTRAL AVENUE. REGISTERED OWNER: MYKHAILO SHEVCHENKO',
            isShareable: true,
            aiTags: ['Property Deed', 'Land Registry', 'Title Deed'],
          },
        ],
      },
      {
        refugeeIndex: 2, // Iryna
        docs: [
          {
            title: 'Ukrainian Passport & Refugee Travel Document',
            category: 'identity',
            filename: 'iryna_travel_document.pdf',
            content: 'REFUGEE TRAVEL DOCUMENT - IRYNA BOYKO - UNHCR REGISTERED DISPLACEMENT PASS',
            isShareable: true,
            aiTags: ['Refugee Pass', 'UNHCR ID', 'Travel Permit'],
          },
          {
            title: 'Insulin Prescription & Diabetes Care Plan',
            category: 'medical',
            filename: 'iryna_diabetes_prescription.pdf',
            content: 'MEDICAL RECORD: IRYNA BOYKO. TYPE 1 DIABETES MELLITUS. DAILY INSULIN DOSAGE PLAN & MONITORING LOG.',
            isShareable: true,
            aiTags: ['Chronic Condition', 'Insulin Prescription', 'Medical Urgent'],
          },
          {
            title: 'Master of Education Certificate',
            category: 'education_property',
            filename: 'iryna_master_education_diploma.pdf',
            content: 'MASTER OF EDUCATION DIPLOMA - IRYNA BOYKO - MARIUPOL STATE UNIVERSITY 2018',
            isShareable: true,
            aiTags: ['Education Diploma', 'Teaching License', 'Verified Degree'],
          },
        ],
      },
    ];

    for (let template of docTemplates) {
      const refugee = seededRefugees[template.refugeeIndex];
      for (let doc of template.docs) {
        const filePath = createDummyFile(doc.filename, doc.content);
        const sha256Hash = generateFileHash(filePath);

        const newDoc = new Document({
          userId: refugee._id,
          title: doc.title,
          category: doc.category,
          filename: doc.filename,
          filepath: `/uploads/${doc.filename}`,
          filetype: 'application/pdf',
          filesize: Buffer.byteLength(doc.content),
          sha256Hash,
          isShareable: doc.isShareable,
          aiTags: doc.aiTags,
          aiConfidence: 0.96,
          verificationBadge: {
            status: 'VERIFIED_IMMUTABLE',
            ledgerTx: '0x' + sha256Hash.substring(0, 32),
            verifiedAt: new Date(),
          },
        });
        await newDoc.save();
      }
    }

    // 4. Seed Medical Triage History
    console.log('Seeding AI Triage History...');
    await new Triage({
      userId: seededRefugees[0]._id, // Oksana
      symptoms: 'Persistent asthma flare-up, coughing at night, low fever 37.8C',
      urgencyLevel: 'Moderate',
      explanation: 'Moderate respiratory distress due to asthma exacerbation aggravated by cold weather transit.',
      suggestedNextStep: 'Schedule appointment at UNHCR Krakow Field Clinic; collect inhaler refill.',
    }).save();

    await new Triage({
      userId: seededRefugees[2]._id, // Iryna
      symptoms: 'High blood sugar, running out of insulin supply, dizziness',
      urgencyLevel: 'Urgent',
      explanation: 'Critical Type 1 Diabetes insulin depletion risk requiring immediate pharmaceutical supply.',
      suggestedNextStep: 'Proceed immediately to Berlin Emergency Pharmacy / Red Cross Desk with IdentiChain QR.',
    }).save();

    // 5. Seed Aid Wallet Transactions & Micro-Aid Requests
    console.log('Seeding Aid Wallet transactions and micro-aid applications...');
    for (let refugee of seededRefugees) {
      const tx1 = new Transaction({
        userId: refugee._id,
        type: 'aid_disbursement',
        title: 'UNHCR Emergency Integration Grant',
        amount: 300,
        currency: 'EUR',
        sender: 'UNHCR Poland Cross-Border Corridor',
        status: 'Completed',
        txHash: generateTxHash(`INIT-${refugee._id}`),
        createdAt: new Date(Date.now() - 86400000 * 5),
      });
      await tx1.save();

      const tx2 = new Transaction({
        userId: refugee._id,
        type: 'pharmacy_voucher',
        title: 'Emergency Medical Pharmacy Voucher',
        amount: 85,
        currency: 'EUR',
        sender: 'Red Cross Medical Relief Pool',
        status: 'Completed',
        txHash: generateTxHash(`PHARM-${refugee._id}`),
        createdAt: new Date(Date.now() - 86400000 * 2),
      });
      await tx2.save();

      // Seed approved aid request
      await new AidRequest({
        userId: refugee._id,
        urgencyReason: 'Emergency winter clothing and transit ticket to refugee reception center',
        amountRequested: 150,
        attachedDocTitle: 'Biometric Ukrainian Passport',
        riskScore: 22,
        riskReasoning: 'Risk Score: 22/100. Cryptographically verified identity document present (-10 risk). Survival category validated.',
        status: 'Approved',
        createdAt: new Date(Date.now() - 86400000 * 1),
      }).save();
    }

    console.log('\n=================================================');
    console.log('  SEED COMPLETE! IdentiChain Database Populated');
    console.log('=================================================');
    console.log('Demo Credentials created:');
    console.log('  Refugee Account 1: oksana@identichain.org / refugee123 (ID: IDC-8F92-4A71-9B3E)');
    console.log('  Refugee Account 2: mykhailo@identichain.org / refugee123 (ID: IDC-73B1-92F0-4C11)');
    console.log('  Refugee Account 3: iryna@identichain.org / refugee123 (ID: IDC-54E9-21D8-8A47)');
    console.log('  Verifier Account 1: verifier.clinic@identichain.org / verifier123 (Role: Clinic)');
    console.log('  Verifier Account 2: verifier.bank@identichain.org / verifier123 (Role: Bank)');
    console.log('  Verifier Account 3: verifier.ngo@identichain.org / verifier123 (Role: NGO)');
    console.log('=================================================\n');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('Seed error:', err);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
