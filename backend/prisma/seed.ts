import { PrismaClient, Province, UserRole, ParkStatus, VisitorType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const _tourist = await prisma.user.upsert({
        where: { email: 'tourist@example.com' },
        update: {},
        create: {
            email: 'tourist@example.com',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Doe',
            phone: '+250788123456',
            role: UserRole.TOURIST,
        },
    });

    const ranger = await prisma.user.upsert({
        where: { email: 'ranger@example.com' },
        update: {},
        create: {
            email: 'ranger@example.com',
            password: hashedPassword,
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+250788234567',
            role: UserRole.RANGER,
        },
    });

    const _admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            phone: '+250788345678',
            role: UserRole.ADMIN,
        },
    });

    console.log('✅ Users created');

    // Create parks
    console.log('Creating parks...');

    const akagera = await prisma.park.create({
        data: {
            name: 'Akagera National Park',
            description: 'Akagera National Park is a protected area in eastern Rwanda covering 1,122 km² along the international border with Tanzania. It was founded in 1934 and includes savannah, montane and swamp habitats. The park is known for its wildlife, including the Big Five.',
            location: 'Kayonza District, Eastern Province',
            province: Province.EASTERN,
            district: 'Kayonza',
            capacity: 200,
            openingTime: '06:00',
            closingTime: '18:00',
            basePrice: 100000,
            imageUrls: [
                '/images/akagera-1.jpg',
                '/images/akagera-2.jpg',
                '/images/akagera-3.jpg',
            ],
            amenities: [
                'Game Drives',
                'Boat Safaris',
                'Fishing',
                'Bird Watching',
                'Camping',
                'Restaurant',
                'Gift Shop',
            ],
            status: ParkStatus.ACTIVE,
        },
    });

    const volcanoes = await prisma.park.create({
        data: {
            name: 'Volcanoes National Park',
            description: 'Volcanoes National Park is a national park in northwestern Rwanda. It covers 160 km² of rainforest and encompasses five of the eight volcanoes in the Virunga Mountains. The park is best known as a sanctuary for the critically endangered mountain gorilla.',
            location: 'Musanze District, Northern Province',
            province: Province.NORTHERN,
            district: 'Musanze',
            capacity: 96,
            openingTime: '07:00',
            closingTime: '17:00',
            basePrice: 1500000,
            imageUrls: [
                '/images/volcanoes-1.jpg',
                '/images/volcanoes-2.jpg',
                '/images/volcanoes-3.jpg',
            ],
            amenities: [
                'Gorilla Trekking',
                'Golden Monkey Tracking',
                'Volcano Hiking',
                'Bird Watching',
                'Cultural Village Tours',
                'Visitor Center',
            ],
            status: ParkStatus.ACTIVE,
        },
    });

    const nyungwe = await prisma.park.create({
        data: {
            name: 'Nyungwe Forest National Park',
            description: 'Nyungwe Forest National Park is located in southwestern Rwanda. The park was established in 2004 and covers an area of approximately 970 km² of rainforest, bamboo, grassland, swamps, and bogs. It is one of the oldest rainforests in Africa.',
            location: 'Rusizi District, Western Province',
            province: Province.WESTERN,
            district: 'Rusizi',
            capacity: 150,
            openingTime: '06:00',
            closingTime: '18:00',
            basePrice: 90000,
            imageUrls: [
                '/images/nyungwe-1.jpg',
                '/images/nyungwe-2.jpg',
                '/images/nyungwe-3.jpg',
            ],
            amenities: [
                'Chimpanzee Tracking',
                'Canopy Walk',
                'Nature Trails',
                'Bird Watching',
                'Waterfall Hikes',
                'Tea Plantation Tours',
            ],
            status: ParkStatus.ACTIVE,
        },
    });

    const gishwati = await prisma.park.create({
        data: {
            name: 'Gishwati-Mukura National Park',
            description: 'Gishwati-Mukura National Park is made up of two separate forests – the larger Gishwati and small Mukura, forming a total of 34 square kilometres of forest. It is Rwanda\'s newest national park, created in 2015.',
            location: 'Ngororero District, Western Province',
            province: Province.WESTERN,
            district: 'Ngororero',
            capacity: 100,
            openingTime: '07:00',
            closingTime: '17:00',
            basePrice: 50000,
            imageUrls: [
                '/images/gishwati-1.jpg',
                '/images/gishwati-2.jpg',
            ],
            amenities: [
                'Primate Tracking',
                'Nature Walks',
                'Bird Watching',
                'Community Tours',
            ],
            status: ParkStatus.ACTIVE,
        },
    });

    console.log('✅ Parks created');

    // Create animals for each park
    console.log('Creating animals...');

    // Akagera animals
    await prisma.animal.createMany({
        data: [
            {
                parkId: akagera.id,
                name: 'African Lion',
                species: 'Panthera leo',
                description: 'The king of the jungle, reintroduced to Akagera in 2015',
                count: 40,
                imageUrl: '/images/animals/lion.jpg',
                endangered: true,
            },
            {
                parkId: akagera.id,
                name: 'African Elephant',
                species: 'Loxodonta africana',
                description: 'The largest land mammal on Earth',
                count: 100,
                imageUrl: '/images/animals/elephant.jpg',
                endangered: true,
            },
            {
                parkId: akagera.id,
                name: 'Black Rhinoceros',
                species: 'Diceros bicornis',
                description: 'Critically endangered rhinos reintroduced in 2017',
                count: 20,
                imageUrl: '/images/animals/rhino.jpg',
                endangered: true,
            },
            {
                parkId: akagera.id,
                name: 'Giraffe',
                species: 'Giraffa camelopardalis',
                description: 'The tallest living terrestrial animal',
                count: 80,
                imageUrl: '/images/animals/giraffe.jpg',
                endangered: false,
            },
            {
                parkId: akagera.id,
                name: 'Zebra',
                species: 'Equus quagga',
                description: 'African equids with distinctive black-and-white striped coats',
                count: 200,
                imageUrl: '/images/animals/zebra.jpg',
                endangered: false,
            },
            {
                parkId: akagera.id,
                name: 'Hippopotamus',
                species: 'Hippopotamus amphibius',
                description: 'Large, mostly herbivorous mammals in sub-Saharan Africa',
                count: 50,
                imageUrl: '/images/animals/hippo.jpg',
                endangered: true,
            },
        ],
    });

    // Volcanoes animals
    await prisma.animal.createMany({
        data: [
            {
                parkId: volcanoes.id,
                name: 'Mountain Gorilla',
                species: 'Gorilla beringei beringei',
                description: 'Critically endangered great apes found in the Virunga Mountains',
                count: 350,
                imageUrl: '/images/animals/gorilla.jpg',
                endangered: true,
            },
            {
                parkId: volcanoes.id,
                name: 'Golden Monkey',
                species: 'Cercopithecus kandti',
                description: 'Endangered species of Old World monkey found in the Virunga volcanic mountains',
                count: 4000,
                imageUrl: '/images/animals/golden-monkey.jpg',
                endangered: true,
            },
        ],
    });

    // Nyungwe animals
    await prisma.animal.createMany({
        data: [
            {
                parkId: nyungwe.id,
                name: 'Chimpanzee',
                species: 'Pan troglodytes',
                description: 'Our closest living relatives in the animal kingdom',
                count: 500,
                imageUrl: '/images/animals/chimpanzee.jpg',
                endangered: true,
            },
            {
                parkId: nyungwe.id,
                name: 'Ruwenzori Colobus',
                species: 'Colobus angolensis ruwenzorii',
                description: 'Large troops of black and white colobus monkeys',
                count: 400,
                imageUrl: '/images/animals/colobus.jpg',
                endangered: false,
            },
            {
                parkId: nyungwe.id,
                name: 'L\'Hoest\'s Monkey',
                species: 'Allochrocebus lhoesti',
                description: 'Mountain monkeys with distinctive white beards',
                count: 200,
                imageUrl: '/images/animals/lhoest-monkey.jpg',
                endangered: true,
            },
        ],
    });

    // Gishwati animals
    await prisma.animal.createMany({
        data: [
            {
                parkId: gishwati.id,
                name: 'Eastern Chimpanzee',
                species: 'Pan troglodytes schweinfurthii',
                description: 'Subspecies of chimpanzee found in central Africa',
                count: 20,
                imageUrl: '/images/animals/chimpanzee.jpg',
                endangered: true,
            },
            {
                parkId: gishwati.id,
                name: 'Blue Monkey',
                species: 'Cercopithecus mitis',
                description: 'Old World monkeys native to Central and East Africa',
                count: 50,
                imageUrl: '/images/animals/blue-monkey.jpg',
                endangered: false,
            },
        ],
    });

    console.log('✅ Animals created');

    // Create pricing rules
    console.log('Creating pricing rules...');

    const today = new Date();
    const parks = [akagera, volcanoes, nyungwe, gishwati];

    for (const park of parks) {
        await prisma.pricingRule.createMany({
            data: [
                {
                    parkId: park.id,
                    visitorType: VisitorType.RWANDAN_ADULT,
                    price: park.name === 'Volcanoes National Park' ? 150000 : 10000,
                    effectiveFrom: today,
                },
                {
                    parkId: park.id,
                    visitorType: VisitorType.RWANDAN_CHILD,
                    price: park.name === 'Volcanoes National Park' ? 75000 : 5000,
                    effectiveFrom: today,
                },
                {
                    parkId: park.id,
                    visitorType: VisitorType.EAC_ADULT,
                    price: park.name === 'Volcanoes National Park' ? 500000 : 30000,
                    effectiveFrom: today,
                },
                {
                    parkId: park.id,
                    visitorType: VisitorType.EAC_CHILD,
                    price: park.name === 'Volcanoes National Park' ? 250000 : 15000,
                    effectiveFrom: today,
                },
                {
                    parkId: park.id,
                    visitorType: VisitorType.FOREIGN_ADULT,
                    price: park.name === 'Volcanoes National Park' ? 1500000 : 100000,
                    effectiveFrom: today,
                },
                {
                    parkId: park.id,
                    visitorType: VisitorType.FOREIGN_CHILD,
                    price: park.name === 'Volcanoes National Park' ? 750000 : 50000,
                    effectiveFrom: today,
                },
            ],
        });
    }

    console.log('✅ Pricing rules created');

    // Create park schedules for next 30 days
    console.log('Creating park schedules...');

    for (const park of parks) {
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            await prisma.parkSchedule.create({
                data: {
                    parkId: park.id,
                    date: date,
                    availableSlots: park.capacity,
                    bookedSlots: 0,
                },
            });
        }
    }

    console.log('✅ Park schedules created');

    // Assign ranger to Akagera
    await prisma.parkRanger.create({
        data: {
            userId: ranger.id,
            parkId: akagera.id,
            isActive: true,
        },
    });

    console.log('✅ Park ranger assigned');

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
