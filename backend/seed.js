const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import all models
const User = require('./models/User');
const Pet = require('./models/Pet');
const Shelter = require('./models/Shelter');
const AdoptionRequest = require('./models/AdoptionRequest');
const Order = require('./models/Order');
const RescueReport = require('./models/RescueReport');
const MedicalRecord = require('./models/MedicalRecord');
const Review = require('./models/Review');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pawconnect');
    console.log('🐾 Connected to MongoDB for seeding...');

    // Clear all existing collections
    await Promise.all([
      User.deleteMany({}),
      Pet.deleteMany({}),
      Shelter.deleteMany({}),
      AdoptionRequest.deleteMany({}),
      Order.deleteMany({}),
      RescueReport.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing database records');

    // 1. Create Shelters
    const shelters = await Shelter.create([
      {
        name: 'Golden Gate Animal Sanctuary',
        description: 'Providing loving shelter and medical rehabilitation for rescue animals across Northern California.',
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: '123 Rescue Way, Golden Gate Park',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94117',
        },
        capacity: 65,
        contactInfo: {
          phone: '(415) 555-0101',
          email: 'info@goldengaterescue.org',
          website: 'https://goldengaterescue.org',
        },
        photos: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'],
      },
      {
        name: 'Pacific Coast Humane Society',
        description: 'Dedicated to preventing cruelty and inspiring compassion towards all animals since 2012.',
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522],
          address: '456 Compassion Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90012',
        },
        capacity: 90,
        contactInfo: {
          phone: '(213) 555-0202',
          email: 'contact@pacificcoastpets.org',
          website: 'https://pacificcoastpets.org',
        },
        photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800'],
      },
      {
        name: 'Bay Area Wildlife & Pet Haven',
        description: 'Specializing in domestic rescues, small animals, rabbits, birds, and bonded pairs.',
        location: {
          type: 'Point',
          coordinates: [-121.8863, 37.3382],
          address: '789 Silicon Valley Way',
          city: 'San Jose',
          state: 'CA',
          zipCode: '95113',
        },
        capacity: 45,
        contactInfo: {
          phone: '(408) 555-0303',
          email: 'hello@baypethaven.org',
          website: 'https://baypethaven.org',
        },
        photos: ['https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800'],
      },
    ]);
    console.log(`✅ Created ${shelters.length} shelters`);

    // 2. Create Users for all roles
    const users = await User.create([
      {
        name: 'Alex Rivera (Platform Admin)',
        email: 'admin@pawconnect.com',
        password: 'admin123',
        role: 'Admin',
        phone: '(555) 010-9900',
        address: { street: '100 Market St', city: 'San Francisco', state: 'CA', zipCode: '94105' },
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        isVerified: true,
      },
      {
        name: 'Sarah Jenkins (Verified Seller)',
        email: 'seller@pawconnect.com',
        password: 'seller123',
        role: 'Seller',
        phone: '(555) 012-3456',
        address: { street: '240 Oak Avenue', city: 'San Francisco', state: 'CA', zipCode: '94102' },
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
        isVerified: true,
      },
      {
        name: 'Elena Rostova (Rescuer & Volunteer)',
        email: 'rescuer@pawconnect.com',
        password: 'rescuer123',
        role: 'Rescuer',
        phone: '(555) 014-7890',
        address: { street: '512 Sunset Blvd', city: 'Los Angeles', state: 'CA', zipCode: '90028' },
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
        isVerified: true,
      },
      {
        name: 'Marcus Brody (Pending Seller)',
        email: 'pending_seller@pawconnect.com',
        password: 'seller123',
        role: 'Seller',
        phone: '(555) 017-6543',
        address: { street: '88 Marina Way', city: 'San Diego', state: 'CA', zipCode: '92101' },
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        isVerified: false, // Testing admin verification workflow
      },
      {
        name: 'David Chen (Adopter & Buyer)',
        email: 'adopter@pawconnect.com',
        password: 'adopter123',
        role: 'Adopter',
        phone: '(555) 019-8765',
        address: { street: '742 Evergreen Terrace', city: 'San Francisco', state: 'CA', zipCode: '94110' },
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        isVerified: true,
      },
      {
        name: 'Emily Watson (Adopter)',
        email: 'emily@pawconnect.com',
        password: 'adopter123',
        role: 'Adopter',
        phone: '(555) 011-2233',
        address: { street: '314 Pine Street', city: 'San Jose', state: 'CA', zipCode: '95120' },
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        isVerified: true,
      },
    ]);
    console.log(`✅ Created ${users.length} users with distinct roles`);

    const adminUser = users[0];
    const sellerUser = users[1];
    const rescuerUser = users[2];
    const pendingSeller = users[3];
    const adopterUser = users[4];
    const adopterEmily = users[5];

    // 3. Create 30+ Realistic Pets (Adoption & Sale listings, multi-species)
    const petsData = [
      // Dogs
      {
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'Male',
        size: 'Large',
        color: 'Golden Cream',
        description: 'Buddy is a happy-go-lucky Golden Retriever who loves splashing in water, playing fetch, and relaxing by your feet.',
        photos: [
          'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
        ],
        listingType: 'adoption',
        price: 50,
        status: 'Available',
        shelterId: shelters[0]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Golden Gate Park, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Rabies', date: new Date('2025-11-10'), nextDue: new Date('2026-11-10') },
          { name: 'DHPP Core', date: new Date('2025-11-10'), nextDue: new Date('2026-11-10') },
          { name: 'Bordetella', date: new Date('2026-01-15'), nextDue: new Date('2026-07-15') },
        ],
        temperament: ['Friendly', 'Playful', 'Kid-friendly', 'Energetic'],
        healthNotes: 'Fully vaccinated, microchipped, and neutered.',
      },
      {
        name: 'Max',
        species: 'Dog',
        breed: 'German Shepherd',
        age: 4,
        gender: 'Male',
        size: 'Large',
        color: 'Black & Tan',
        description: 'Extremely intelligent and alert German Shepherd. Knows basic obedience commands and walks gracefully on leash.',
        photos: [
          'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800',
        ],
        listingType: 'adoption',
        price: 60,
        status: 'Available',
        shelterId: shelters[1]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522],
          address: 'Downtown Los Angeles, CA',
          city: 'Los Angeles',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Rabies', date: new Date('2025-10-01'), nextDue: new Date('2026-10-01') },
          { name: 'DHPP', date: new Date('2025-10-01'), nextDue: new Date('2026-10-01') },
        ],
        temperament: ['Protective', 'Loyal', 'Intelligent', 'Calm'],
        healthNotes: 'Excellent health, joint supplements included.',
      },
      {
        name: 'Bella',
        species: 'Dog',
        breed: 'Labrador Retriever',
        age: 2,
        gender: 'Female',
        size: 'Medium',
        color: 'Chocolate Brown',
        description: 'Sweet, cuddly lab mix who was rescued during a storm. She gets along wonderfully with cats and loves squeaky toys.',
        photos: [
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
        ],
        listingType: 'adoption',
        price: 45,
        status: 'Pending',
        shelterId: shelters[0]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4200, 37.7755],
          address: 'Mission District, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Rabies', date: new Date('2026-02-01'), nextDue: new Date('2027-02-01') },
        ],
        temperament: ['Gentle', 'Affectionate', 'Good with other pets'],
        healthNotes: 'Spayed, up to date on all preventatives.',
      },
      {
        name: 'Coco',
        species: 'Dog',
        breed: 'Toy Poodle (Champion Pedigree)',
        age: 1,
        gender: 'Female',
        size: 'Small',
        color: 'Apricot',
        description: 'Purebred Toy Poodle puppy from health-tested parents. Hypoallergenic coat, crate trained, and microchipped.',
        photos: [
          'https://images.unsplash.com/photo-1516371535707-512a1e83bb9a?w=800',
        ],
        listingType: 'sale',
        price: 450,
        status: 'Available',
        ownerId: sellerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4089, 37.7833],
          address: 'SoMa, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Puppy Core DHPP', date: new Date('2026-01-20'), nextDue: new Date('2027-01-20') },
          { name: 'Rabies', date: new Date('2026-02-15'), nextDue: new Date('2027-02-15') },
        ],
        temperament: ['Playful', 'Lap dog', 'Hypoallergenic', 'Sweet'],
        healthNotes: 'Genetic DNA screening negative for PRA and patellar luxation.',
      },
      {
        name: 'Rocky',
        species: 'Dog',
        breed: 'French Bulldog',
        age: 2,
        gender: 'Male',
        size: 'Small',
        color: 'Fawn with Black Mask',
        description: 'Charming Frenchie looking for a loving apartment home. Loves napping on pillows and short neighborhood strolls.',
        photos: [
          'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
        ],
        listingType: 'sale',
        price: 550,
        status: 'Available',
        ownerId: sellerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4312, 37.7694],
          address: 'Haight-Ashbury, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Rabies', date: new Date('2025-12-05'), nextDue: new Date('2026-12-05') },
        ],
        temperament: ['Quiet', 'Couch Potato', 'Affectionate'],
        healthNotes: 'Clear breathing airways, veterinary certified.',
      },
      {
        name: 'Bailey',
        species: 'Dog',
        breed: 'Border Collie Mix',
        age: 2,
        gender: 'Male',
        size: 'Medium',
        color: 'Black & White',
        description: 'Super energetic and athletic Border Collie mix. Loves agility training, frisbee, and outdoor hikes.',
        photos: [
          'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800',
        ],
        listingType: 'adoption',
        price: 30,
        status: 'Available',
        shelterId: shelters[2]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-121.8863, 37.3382],
          address: 'San Jose, CA',
          city: 'San Jose',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Rabies', date: new Date('2025-09-12'), nextDue: new Date('2026-09-12') },
        ],
        temperament: ['Energetic', 'Agile', 'Smart', 'Athletic'],
        healthNotes: 'Neutered and flea-treated.',
      },
      {
        name: 'Zeus',
        species: 'Dog',
        breed: 'Siberian Husky',
        age: 3,
        gender: 'Male',
        size: 'Large',
        color: 'Silver & White',
        description: 'Striking blue-eyed Husky who sings vocal greetings and loves cold weather adventures.',
        photos: [
          'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800',
        ],
        listingType: 'adoption',
        price: 50,
        status: 'Available',
        shelterId: shelters[1]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-118.2500, 34.0600],
          address: 'Echo Park, Los Angeles, CA',
          city: 'Los Angeles',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Core Vaccines', date: new Date('2025-11-20'), nextDue: new Date('2026-11-20') },
        ],
        temperament: ['Talkative', 'Adventurous', 'Playful'],
        healthNotes: 'Microchipped, high energy needs yard.',
      },
      {
        name: 'Daisy',
        species: 'Dog',
        breed: 'Beagle',
        age: 1,
        gender: 'Female',
        size: 'Small',
        color: 'Tricolor',
        description: 'Curious little hound with a great nose and big floppy ears. Gentle with toddlers.',
        photos: [
          'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800',
        ],
        listingType: 'adoption',
        price: 40,
        status: 'Available',
        shelterId: shelters[0]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Richmond District, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'DHPP & Rabies', date: new Date('2026-01-10'), nextDue: new Date('2027-01-10') },
        ],
        temperament: ['Curious', 'Gentle', 'Food-motivated'],
        healthNotes: 'Spayed, healthy heart.',
      },

      // Cats
      {
        name: 'Luna',
        species: 'Cat',
        breed: 'Siamese',
        age: 2,
        gender: 'Female',
        size: 'Small',
        color: 'Seal Point',
        description: 'Graceful Siamese beauty who loves sunbathing on window perches and vocalizing affectionate purrs.',
        photos: [
          'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800',
        ],
        listingType: 'adoption',
        price: 35,
        status: 'Available',
        shelterId: shelters[0]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'FVRCP', date: new Date('2025-10-15'), nextDue: new Date('2026-10-15') },
          { name: 'Rabies', date: new Date('2025-10-15'), nextDue: new Date('2026-10-15') },
        ],
        temperament: ['Affectionate', 'Vocal', 'Curious', 'Lap Cat'],
        healthNotes: 'FeLV/FIV negative, spayed.',
      },
      {
        name: 'Whiskers',
        species: 'Cat',
        breed: 'Maine Coon',
        age: 3,
        gender: 'Male',
        size: 'Large',
        color: 'Silver Tabby',
        description: 'Majestic Maine Coon with a glorious fluffy coat and tufted ears. A calm, gentle giant.',
        photos: [
          'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=800',
        ],
        listingType: 'sale',
        price: 350,
        status: 'Sold',
        ownerId: sellerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4000, 37.7800],
          address: 'Embarcadero, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'FVRCP', date: new Date('2025-08-01'), nextDue: new Date('2026-08-01') },
        ],
        temperament: ['Gentle Giant', 'Calm', 'Affectionate'],
        healthNotes: 'HCM ultrasound normal, pedigree registered.',
      },
      {
        name: 'Shadow',
        species: 'Cat',
        breed: 'Bombay Domestic Shorthair',
        age: 2,
        gender: 'Male',
        size: 'Medium',
        color: 'Glossy Black',
        description: 'Sleek mini-panther who was rescued from an alleyway. Enjoys laser pointers and sleeping on soft fleece blankets.',
        photos: [
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
        ],
        listingType: 'adoption',
        price: 25,
        status: 'Available',
        shelterId: shelters[1]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522],
          address: 'Silver Lake, Los Angeles, CA',
          city: 'Los Angeles',
          state: 'CA',
        },
        vaccinations: [
          { name: 'FVRCP', date: new Date('2025-12-01'), nextDue: new Date('2026-12-01') },
        ],
        temperament: ['Playful', 'Stealthy', 'Affectionate'],
        healthNotes: 'Neutered, microchipped.',
      },
      {
        name: 'Milo',
        species: 'Cat',
        breed: 'British Shorthair',
        age: 1,
        gender: 'Male',
        size: 'Medium',
        color: 'Classic Blue-Gray',
        description: 'Plump cheeked British Shorthair with deep copper eyes. Very calm demeanor, ideal companion for home office.',
        photos: [
          'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800',
        ],
        listingType: 'sale',
        price: 380,
        status: 'Available',
        ownerId: sellerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4200, 37.7700],
          address: 'Hayes Valley, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'All Kitten Vaccinations', date: new Date('2026-01-05'), nextDue: new Date('2027-01-05') },
        ],
        temperament: ['Dignified', 'Calm', 'Affectionate'],
        healthNotes: 'Purebred, pedigree certified.',
      },
      {
        name: 'Chloe',
        species: 'Cat',
        breed: 'Calico Shorthair',
        age: 3,
        gender: 'Female',
        size: 'Small',
        color: 'Tricolor Calico',
        description: 'Vibrant calico personality with lots of affection to give. Rescued with her kittens who have all found homes.',
        photos: [
          'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800',
        ],
        listingType: 'adoption',
        price: 25,
        status: 'Available',
        shelterId: shelters[2]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-121.8900, 37.3400],
          address: 'Willow Glen, San Jose, CA',
          city: 'San Jose',
          state: 'CA',
        },
        vaccinations: [
          { name: 'FVRCP', date: new Date('2025-11-15'), nextDue: new Date('2026-11-15') },
        ],
        temperament: ['Sweet', 'Playful', 'Chirpy'],
        healthNotes: 'Spayed, dental cleaned.',
      },
      {
        name: 'Oliver',
        species: 'Cat',
        breed: 'Orange Tabby',
        age: 2,
        gender: 'Male',
        size: 'Large',
        color: 'Ginger Tabby',
        description: 'Friendly orange boy who demands chin scratches and greets everyone at the front door.',
        photos: [
          'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800',
        ],
        listingType: 'adoption',
        price: 20,
        status: 'Adopted',
        shelterId: shelters[0]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Rabies', date: new Date('2025-07-20'), nextDue: new Date('2026-07-20') },
        ],
        temperament: ['Outgoing', 'Loving', 'Talkative'],
        healthNotes: 'Happy and healthy.',
      },

      // Birds
      {
        name: 'Tweety',
        species: 'Bird',
        breed: 'Cockatiel',
        age: 1,
        gender: 'Female',
        size: 'Small',
        color: 'Pearl Yellow',
        description: 'Hand-tamed cockatiel who mimics household whistles and will step onto your finger happily.',
        photos: [
          'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800',
        ],
        listingType: 'adoption',
        price: 25,
        status: 'Available',
        shelterId: shelters[0]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Sunset District, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [],
        temperament: ['Curious', 'Vocal', 'Hand-tamed'],
        healthNotes: 'Healthy feathers, avian vet checked.',
      },
      {
        name: 'Kiwi',
        species: 'Bird',
        breed: 'Green Budgerigar',
        age: 1,
        gender: 'Male',
        size: 'Small',
        color: 'Bright Green & Yellow',
        description: 'Playful little parakeet who loves mirrors, bells, and fresh millet spray treats.',
        photos: [
          'https://images.unsplash.com/photo-1501720804996-ae418d1ba820?w=800',
        ],
        listingType: 'sale',
        price: 45,
        status: 'Available',
        ownerId: sellerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4100, 37.7700],
          address: 'Potrero Hill, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [],
        temperament: ['Active', 'Chirpy', 'Social'],
        healthNotes: 'Beak and feather condition excellent.',
      },
      {
        name: 'Rio',
        species: 'Bird',
        breed: 'Sun Conure',
        age: 2,
        gender: 'Male',
        size: 'Medium',
        color: 'Sunset Orange & Yellow',
        description: 'Vibrant and affectionate parrot who loves snuggling into hoodies and dancing to music.',
        photos: [
          'https://images.unsplash.com/photo-1549608276-5786777e6587?w=800',
        ],
        listingType: 'sale',
        price: 280,
        status: 'Available',
        ownerId: sellerUser._id,
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522],
          address: 'Glendale, Los Angeles, CA',
          city: 'Los Angeles',
          state: 'CA',
        },
        vaccinations: [],
        temperament: ['Smart', 'Loud', 'Cuddly'],
        healthNotes: 'DNA sexed male, healthy avian diet.',
      },
      {
        name: 'Sunny',
        species: 'Bird',
        breed: 'Canary',
        age: 1,
        gender: 'Male',
        size: 'Small',
        color: 'Lemon Yellow',
        description: 'Melodious singing canary that brings gentle acoustic warmth to any household.',
        photos: [
          'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=800',
        ],
        listingType: 'adoption',
        price: 20,
        status: 'Available',
        shelterId: shelters[2]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-121.8863, 37.3382],
          address: 'San Jose, CA',
          city: 'San Jose',
          state: 'CA',
        },
        vaccinations: [],
        temperament: ['Musical', 'Calm', 'Independent'],
        healthNotes: 'Active singer, healthy plumage.',
      },

      // Rabbits
      {
        name: 'Thumper',
        species: 'Rabbit',
        breed: 'Holland Lop',
        age: 1,
        gender: 'Male',
        size: 'Small',
        color: 'Tortoiseshell',
        description: 'Adorable Holland Lop with gentle droopy ears. Litterbox trained and loves fresh dandelion greens and timothy hay.',
        photos: [
          'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800',
        ],
        listingType: 'adoption',
        price: 30,
        status: 'Available',
        shelterId: shelters[1]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522],
          address: 'Pasadena, CA',
          city: 'Pasadena',
          state: 'CA',
        },
        vaccinations: [
          { name: 'RHDV2', date: new Date('2025-10-10'), nextDue: new Date('2026-10-10') },
        ],
        temperament: ['Docile', 'Gentle', 'Litter-trained'],
        healthNotes: 'Neutered, dental check clear.',
      },
      {
        name: 'Snowball',
        species: 'Rabbit',
        breed: 'Netherland Dwarf',
        age: 1,
        gender: 'Female',
        size: 'Small',
        color: 'Pure White with Blue Eyes',
        description: 'Tiny Netherland Dwarf bunny with soft snowy fur. Enjoys tunnels and cardboard chew toys.',
        photos: [
          'https://images.unsplash.com/photo-1591382696684-38c427c7547a?w=800',
        ],
        listingType: 'sale',
        price: 95,
        status: 'Available',
        ownerId: sellerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Pac Heights, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'RHDV2', date: new Date('2026-01-15'), nextDue: new Date('2027-01-15') },
        ],
        temperament: ['Curious', 'Quiet', 'Playful'],
        healthNotes: 'Vaccinated and health cleared.',
      },
      {
        name: 'Oreo',
        species: 'Rabbit',
        breed: 'Mini Rex',
        age: 2,
        gender: 'Male',
        size: 'Small',
        color: 'Black & White Velvet',
        description: 'Velvet-soft fur that feels like plush chinchilla. Loves gentle head rubs and exploring cozy rugs.',
        photos: [
          'https://images.unsplash.com/photo-1535241749838-299277b6305f?w=800',
        ],
        listingType: 'adoption',
        price: 25,
        status: 'Available',
        shelterId: shelters[2]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-121.8863, 37.3382],
          address: 'Santa Clara, CA',
          city: 'Santa Clara',
          state: 'CA',
        },
        vaccinations: [
          { name: 'RHDV2', date: new Date('2025-11-05'), nextDue: new Date('2026-11-05') },
        ],
        temperament: ['Velvety', 'Friendly', 'Loves Greens'],
        healthNotes: 'Neutered, healthy digestive tract.',
      },
      {
        name: 'Clover',
        species: 'Rabbit',
        breed: 'Lionhead',
        age: 1,
        gender: 'Female',
        size: 'Small',
        color: 'Caramel Mane',
        description: 'Distinguished lion mane fringe around her neck. Very tame and loves sitting next to you during reading time.',
        photos: [
          'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800',
        ],
        listingType: 'adoption',
        price: 30,
        status: 'Available',
        shelterId: shelters[0]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'RHDV2', date: new Date('2025-12-10'), nextDue: new Date('2026-12-10') },
        ],
        temperament: ['Calm', 'Affectionate', 'Gentle'],
        healthNotes: 'Spayed and microchipped.',
      },

      // Other species (Hamsters, Guinea Pigs, Turtles)
      {
        name: 'Peanut',
        species: 'Other',
        breed: 'Abyssinian Guinea Pig',
        age: 1,
        gender: 'Male',
        size: 'Small',
        color: 'Calico Swirls',
        description: 'Vocal guinea pig that squeaks with joy when the refrigerator crisper drawer opens for bell peppers.',
        photos: [
          'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800',
        ],
        listingType: 'adoption',
        price: 15,
        status: 'Available',
        shelterId: shelters[2]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-121.8863, 37.3382],
          address: 'San Jose, CA',
          city: 'San Jose',
          state: 'CA',
        },
        vaccinations: [],
        temperament: ['Vocal', 'Sweet', 'Cuddly'],
        healthNotes: 'Supplied with vitamin C drops, healthy coat.',
      },
      {
        name: 'Shelly',
        species: 'Other',
        breed: 'Russian Tortoise',
        age: 5,
        gender: 'Female',
        size: 'Small',
        color: 'Olive Green Shell',
        description: 'Hardy little herbivorous tortoise looking for an indoor garden enclosure or secure outdoor sun run.',
        photos: [
          'https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?w=800',
        ],
        listingType: 'adoption',
        price: 35,
        status: 'Available',
        shelterId: shelters[1]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-118.2437, 34.0522],
          address: 'Burbank, CA',
          city: 'Burbank',
          state: 'CA',
        },
        vaccinations: [],
        temperament: ['Docile', 'Herbivore', 'Low Maintenance'],
        healthNotes: 'Smooth shell, excellent appetite for leafy greens.',
      },
      {
        name: 'Nugget',
        species: 'Other',
        breed: 'Syrian Hamster',
        age: 1,
        gender: 'Female',
        size: 'Small',
        color: 'Golden Cream',
        description: 'Curious night explorer who loves exercise wheels, burrowing tunnels, and sunflower seed treats.',
        photos: [
          'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800',
        ],
        listingType: 'adoption',
        price: 10,
        status: 'Available',
        shelterId: shelters[0]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [],
        temperament: ['Nocturnal', 'Active', 'Gentle'],
        healthNotes: 'Healthy, includes starter habitat accessories.',
      },
      {
        name: 'Biscuit',
        species: 'Dog',
        breed: 'Corgi Mix',
        age: 2,
        gender: 'Male',
        size: 'Small',
        color: 'Red & White',
        description: 'Low-rider with a gigantic heart! Biscuit loves belly rubs and trotting beside his human companions.',
        photos: [
          'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=800',
        ],
        listingType: 'sale',
        price: 320,
        status: 'Available',
        ownerId: sellerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Marina District, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Core Vaccines', date: new Date('2025-11-01'), nextDue: new Date('2026-11-01') },
        ],
        temperament: ['Cheerful', 'Playful', 'Great with kids'],
        healthNotes: 'Dewormed and flea-free.',
      },
      {
        name: 'Simba',
        species: 'Cat',
        breed: 'Abyssinian',
        age: 2,
        gender: 'Male',
        size: 'Medium',
        color: 'Ruddy Agouti',
        description: 'Athletic feline who perches on high ledges like a little cougar. Very social and loves games of tag.',
        photos: [
          'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=800',
        ],
        listingType: 'sale',
        price: 290,
        status: 'Available',
        ownerId: sellerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Nob Hill, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'FVRCP', date: new Date('2025-12-15'), nextDue: new Date('2026-12-15') },
        ],
        temperament: ['Curious', 'Acrobatic', 'Affectionate'],
        healthNotes: 'FIV/FeLV negative.',
      },
      {
        name: 'Jasper',
        species: 'Dog',
        breed: 'Australian Shepherd',
        age: 3,
        gender: 'Male',
        size: 'Medium',
        color: 'Blue Merle',
        description: 'Stunning blue merle Aussie with striking marbled eyes. Eager to please, obedient, and loves hiking trails.',
        photos: [
          'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800',
        ],
        listingType: 'adoption',
        price: 60,
        status: 'Available',
        shelterId: shelters[0]._id,
        ownerId: rescuerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Presidio, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Rabies & Bordetella', date: new Date('2025-10-25'), nextDue: new Date('2026-10-25') },
        ],
        temperament: ['Intelligent', 'Focused', 'High energy'],
        healthNotes: 'Neutered, hip clearances certified.',
      },
      {
        name: 'Penny',
        species: 'Dog',
        breed: 'Dachshund',
        age: 1,
        gender: 'Female',
        size: 'Small',
        color: 'Dapple Red',
        description: 'Playful miniature dachshund who loves burrowing into fleece blankets and giving enthusiastic puppy kisses.',
        photos: [
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800',
        ],
        listingType: 'sale',
        price: 420,
        status: 'Available',
        ownerId: sellerUser._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Castro, San Francisco, CA',
          city: 'San Francisco',
          state: 'CA',
        },
        vaccinations: [
          { name: 'Full Puppy Vaccinations', date: new Date('2026-02-05'), nextDue: new Date('2027-02-05') },
        ],
        temperament: ['Playful', 'Burrower', 'Snuggly'],
        healthNotes: 'IVDD screened, healthy back and joints.',
      },
    ];

    const pets = await Pet.create(petsData);
    console.log(`✅ Created ${pets.length} pets (Adoption & Sale, 5 species)`);

    // 4. Create Medical Records for pets
    await MedicalRecord.create([
      {
        petId: pets[0]._id, // Buddy
        vetName: 'Dr. Katherine Wells, DVM',
        clinicName: 'San Francisco Veterinary Specialists',
        treatment: 'Annual Wellness & Dental Scaling',
        diagnosis: 'Healthy adult canine. Grade 1 tartar removed.',
        medications: [{ name: 'Heartgard Plus', dosage: '1 chewable', frequency: 'Monthly' }],
        documents: ['wellness_exam_cert.pdf'],
        notes: 'Buddy behaved wonderfully during oral exam.',
        cost: 185,
        date: new Date('2025-11-10'),
      },
      {
        petId: pets[0]._id,
        vetName: 'Dr. Katherine Wells, DVM',
        clinicName: 'San Francisco Veterinary Specialists',
        treatment: 'Microchip Implantation & Registration',
        documents: ['microchip_form.pdf'],
        cost: 65,
        date: new Date('2025-05-15'),
      },
      {
        petId: pets[1]._id, // Max
        vetName: 'Dr. Gregory House, DVM',
        clinicName: 'Angel City Animal Hospital',
        treatment: 'Hip & Joint Radiograph Screening',
        diagnosis: 'OFA Good bilateral hips, no signs of dysplasia.',
        cost: 290,
        date: new Date('2025-10-01'),
      },
      {
        petId: pets[8]._id, // Luna
        vetName: 'Dr. Fiona Gallagher, DVM',
        clinicName: 'Cat Care Clinic SF',
        treatment: 'Spay Surgery & Core Vaccines',
        cost: 220,
        date: new Date('2025-04-12'),
      },
    ]);
    console.log(`✅ Created medical records`);

    // 5. Create Reviews for Seller
    await Review.create([
      {
        reviewerId: adopterUser._id,
        sellerId: sellerUser._id,
        petId: pets[9]._id, // Whiskers
        rating: 5,
        comment: 'Sarah is an outstanding seller! She provided full health guarantees, vet certifications, and a starter pack. Whiskers is the most well-socialized Maine Coon ever.',
      },
      {
        reviewerId: adopterEmily._id,
        sellerId: sellerUser._id,
        rating: 5,
        comment: 'Very professional, transparent, and clearly deeply cares about animal welfare. 10/10 experience on PawConnect.',
      },
    ]);
    console.log(`✅ Created seller reviews`);

    // 6. Create Adoption Requests
    await AdoptionRequest.create([
      {
        userId: adopterUser._id,
        petId: pets[2]._id, // Bella (Pending)
        sellerId: rescuerUser._id,
        status: 'Pending',
        message: 'We have a fenced half-acre backyard and I work from home full time. Bella would have non-stop love and daily park runs.',
        applicantInfo: {
          phone: '(555) 019-8765',
          residenceType: 'House with Fenced Yard',
          hasYard: true,
          hasOtherPets: false,
          experienceYears: 5,
        },
        requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: adopterEmily._id,
        petId: pets[13]._id, // Oliver (Adopted)
        sellerId: rescuerUser._id,
        status: 'Approved',
        message: 'We are a quiet cat-loving couple looking for an orange companion. Oliver has stolen our hearts!',
        requestedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`✅ Created sample adoption requests`);

    // Add adopted pet to user
    await User.findByIdAndUpdate(adopterEmily._id, {
      $addToSet: { adoptedPets: pets[13]._id },
    });

    // 7. Create Orders (Marketplace pet sales)
    await Order.create([
      {
        buyerId: adopterUser._id,
        sellerId: sellerUser._id,
        petId: pets[9]._id, // Whiskers
        amount: 350,
        currency: 'USD',
        paymentStatus: 'Paid',
        paymentMethod: 'stripe',
        stripeSessionId: 'cs_test_mockWhiskersSession123',
        deliveryOption: 'Local Pickup',
        shippingAddress: {
          street: '742 Evergreen Terrace',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94110',
          country: 'USA',
        },
        buyerContact: {
          phone: '(555) 019-8765',
          email: 'adopter@pawconnect.com',
        },
        paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`✅ Created sample marketplace orders`);

    // Add Whiskers to adopterUser adoptedPets
    await User.findByIdAndUpdate(adopterUser._id, {
      $addToSet: { adoptedPets: pets[9]._id },
    });

    // 8. Create Community Rescue Reports
    await RescueReport.create([
      {
        reporterName: 'Elena Rostova',
        reporterId: rescuerUser._id,
        reporterPhone: '(555) 014-7890',
        location: {
          lat: 37.7749,
          lng: -122.4194,
          address: 'Near Golden Gate Park Conservatory of Flowers',
          city: 'San Francisco',
          state: 'CA',
        },
        animalCondition: 'Injured',
        species: 'Dog',
        description: 'Found a frightened young terrier mix with a bruised front right paw wandering near the park trail. Very gentle, drinking water.',
        photos: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800'],
        status: 'In-Progress',
        assignedVolunteerId: rescuerUser._id,
        reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        reporterName: 'David Chen',
        reporterId: adopterUser._id,
        reporterPhone: '(555) 019-8765',
        location: {
          lat: 37.7850,
          lng: -122.4050,
          address: '4th and Howard Street, SoMa',
          city: 'San Francisco',
          state: 'CA',
        },
        animalCondition: 'Critical',
        species: 'Cat',
        description: 'Small ginger kitten trapped under construction scaffolding. Dehydrated and crying loudly.',
        photos: ['https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800'],
        status: 'Rescued',
        assignedVolunteerId: rescuerUser._id,
        resolutionNotes: 'Safely extracted and transferred to Golden Gate Sanctuary for intravenous hydration.',
        reportedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        reporterName: 'Good Samaritan',
        reporterPhone: '(555) 998-1122',
        location: {
          lat: 34.0522,
          lng: -118.2437,
          address: 'Griffith Park Trailhead, Los Angeles',
          city: 'Los Angeles',
          state: 'CA',
        },
        animalCondition: 'Healthy',
        species: 'Rabbit',
        description: 'Domestic white rabbit spotted nibbling clovers near picnic table. Looks like an escaped pet.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800'],
        status: 'Reported',
        reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`✅ Created community rescue reports`);

    console.log('\n=========================================');
    console.log('🎉 PawConnect DB Seeded Successfully!');
    console.log('=========================================');
    console.log('Demo Credentials:');
    console.log('👑 Admin:          admin@pawconnect.com          / admin123');
    console.log('🐾 Rescuer:        rescuer@pawconnect.com        / rescuer123');
    console.log('🛍️ Verified Seller: seller@pawconnect.com         / seller123');
    console.log('⏳ Pending Seller:  pending_seller@pawconnect.com / seller123');
    console.log('❤️ Adopter/Buyer:  adopter@pawconnect.com        / adopter123');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
