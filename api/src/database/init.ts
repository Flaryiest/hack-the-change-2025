import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database initialization...');

  try {
    // Clear existing data
    await prisma.user.deleteMany();
    console.log('Cleared existing users');

    // Senegal village data - 50 villages with realistic needs and resources
    const villages = [
      // Villages with medical needs
      {
        name: 'Touba',
        location: 'Diourbel Region, Senegal',
        coordinates: '14.8500,-15.8833',
        facts: [
          'Need medical supplies',
          'Need doctors',
          'Has school',
          'Strong agricultural community'
        ]
      },
      {
        name: 'Kaolack',
        location: 'Kaolack Region, Senegal',
        coordinates: '14.1500,-16.0667',
        facts: [
          'Need vaccines',
          'Need nurses',
          'Has market center',
          'Peanut farming'
        ]
      },
      {
        name: 'Tambacounda',
        location: 'Tambacounda Region, Senegal',
        coordinates: '13.7667,-13.6667',
        facts: [
          'Need emergency medical care',
          'Need ambulance',
          'Has radio station',
          'Cotton production'
        ]
      },
      {
        name: 'Kolda',
        location: 'Kolda Region, Senegal',
        coordinates: '12.9000,-14.9500',
        facts: [
          'Need malaria treatment',
          'Need clean water',
          'Has clinic building',
          'Rice farming'
        ]
      },
      {
        name: 'Mbour',
        location: 'Thiès Region, Senegal',
        coordinates: '14.4167,-16.9667',
        facts: [
          'Need pediatrician',
          'Has fishing boats',
          'Tourism resources',
          'Fresh fish available'
        ]
      },

      // Villages with medical resources
      {
        name: 'Thies',
        location: 'Thiès Region, Senegal',
        coordinates: '14.7833,-16.9333',
        facts: [
          'Has doctors',
          'Has hospital',
          'Medical supplies available',
          'Training center'
        ]
      },
      {
        name: 'Saint-Louis',
        location: 'Saint-Louis Region, Senegal',
        coordinates: '16.0167,-16.5000',
        facts: [
          'Has nurses',
          'Has pharmacy',
          'Medical equipment',
          'UNESCO heritage site'
        ]
      },
      {
        name: 'Ziguinchor',
        location: 'Ziguinchor Region, Senegal',
        coordinates: '12.5667,-16.2667',
        facts: [
          'Has medical staff',
          'Has ambulance',
          'First aid supplies',
          'Fruit cultivation'
        ]
      },

      // Villages needing food/agriculture support
      {
        name: 'Linguere',
        location: 'Louga Region, Senegal',
        coordinates: '15.3833,-15.1167',
        facts: [
          'Need food supplies',
          'Need farming equipment',
          'Drought affected',
          'Livestock herding'
        ]
      },
      {
        name: 'Matam',
        location: 'Matam Region, Senegal',
        coordinates: '15.6500,-13.2500',
        facts: [
          'Need seeds',
          'Need irrigation',
          'Food shortage',
          'Has riverside land'
        ]
      },
      {
        name: 'Podor',
        location: 'Saint-Louis Region, Senegal',
        coordinates: '16.6500,-14.9667',
        facts: [
          'Need fertilizer',
          'Need farming tools',
          'Has arable land',
          'River fishing'
        ]
      },
      {
        name: 'Kedougou',
        location: 'Kedougou Region, Senegal',
        coordinates: '12.5500,-12.1833',
        facts: [
          'Need food aid',
          'Need storage facilities',
          'Gold mining area',
          'Has forest resources'
        ]
      },
      {
        name: 'Bakel',
        location: 'Tambacounda Region, Senegal',
        coordinates: '14.9000,-10.9833',
        facts: [
          'Need grain supplies',
          'Need water pumps',
          'Has gardens',
          'Gum arabic production'
        ]
      },

      // Villages with food/agriculture resources
      {
        name: 'Fatick',
        location: 'Fatick Region, Senegal',
        coordinates: '14.3333,-16.4167',
        facts: [
          'Has surplus grain',
          'Has farming equipment',
          'Agricultural training',
          'Millet production'
        ]
      },
      {
        name: 'Kaffrine',
        location: 'Kaffrine Region, Senegal',
        coordinates: '14.1000,-15.5500',
        facts: [
          'Has livestock',
          'Has seeds available',
          'Veterinary services',
          'Cattle breeding'
        ]
      },
      {
        name: 'Nioro du Rip',
        location: 'Kaolack Region, Senegal',
        coordinates: '13.7500,-15.8000',
        facts: [
          'Has food storage',
          'Has tractors',
          'Irrigation system',
          'Vegetable farming'
        ]
      },
      {
        name: 'Koungheul',
        location: 'Kaffrine Region, Senegal',
        coordinates: '13.9833,-14.8000',
        facts: [
          'Has surplus food',
          'Has farm tools',
          'Well maintained',
          'Sorghum cultivation'
        ]
      },

      // Villages needing education
      {
        name: 'Velingara',
        location: 'Kolda Region, Senegal',
        coordinates: '13.1500,-14.1167',
        facts: [
          'Need teachers',
          'Need school supplies',
          'Need textbooks',
          'Has school building'
        ]
      },
      {
        name: 'Sedhiou',
        location: 'Sedhiou Region, Senegal',
        coordinates: '12.7083,-15.5569',
        facts: [
          'Need education materials',
          'Need computers',
          'Youth training needed',
          'Has community center'
        ]
      },
      {
        name: 'Bignona',
        location: 'Ziguinchor Region, Senegal',
        coordinates: '12.8167,-16.2333',
        facts: [
          'Need literacy program',
          'Need vocational training',
          'Has motivated youth',
          'Cashew processing'
        ]
      },
      {
        name: 'Oussouye',
        location: 'Ziguinchor Region, Senegal',
        coordinates: '12.4850,-16.5472',
        facts: [
          'Need school renovation',
          'Need teachers',
          'Cultural preservation',
          'Palm wine production'
        ]
      },

      // Villages with education resources
      {
        name: 'Louga',
        location: 'Louga Region, Senegal',
        coordinates: '15.6167,-16.2167',
        facts: [
          'Has teachers',
          'Has school supplies',
          'Education program',
          'Technical training'
        ]
      },
      {
        name: 'Diourbel',
        location: 'Diourbel Region, Senegal',
        coordinates: '14.6500,-16.2333',
        facts: [
          'Has library',
          'Has computers',
          'Adult education',
          'Religious education center'
        ]
      },
      {
        name: 'Tivaouane',
        location: 'Thiès Region, Senegal',
        coordinates: '14.9500,-16.8167',
        facts: [
          'Has vocational school',
          'Has training materials',
          'Skills development',
          'Tailoring training'
        ]
      },

      // Villages needing infrastructure
      {
        name: 'Sokone',
        location: 'Fatick Region, Senegal',
        coordinates: '13.8833,-16.3667',
        facts: [
          'Need clean water',
          'Need electricity',
          'Need roads',
          'Has mangroves'
        ]
      },
      {
        name: 'Joal-Fadiouth',
        location: 'Thiès Region, Senegal',
        coordinates: '14.1667,-16.8333',
        facts: [
          'Need water wells',
          'Need sanitation',
          'Fishing community',
          'Shell island'
        ]
      },
      {
        name: 'Foundiougne',
        location: 'Fatick Region, Senegal',
        coordinates: '14.1333,-16.4667',
        facts: [
          'Need solar panels',
          'Need water system',
          'River port',
          'Oyster farming'
        ]
      },
      {
        name: 'Kanel',
        location: 'Matam Region, Senegal',
        coordinates: '15.5167,-13.1667',
        facts: [
          'Need power generator',
          'Need wells',
          'Has land',
          'Date palm cultivation'
        ]
      },
      {
        name: 'Ranérou',
        location: 'Matam Region, Senegal',
        coordinates: '15.3000,-13.9667',
        facts: [
          'Need water infrastructure',
          'Need bridge',
          'Remote location',
          'Nomadic herding'
        ]
      },

      // Villages with infrastructure resources
      {
        name: 'Darou Mousty',
        location: 'Louga Region, Senegal',
        coordinates: '15.5500,-15.8833',
        facts: [
          'Has solar power',
          'Has well system',
          'Electrical supplies',
          'Construction materials'
        ]
      },
      {
        name: 'Mbacke',
        location: 'Diourbel Region, Senegal',
        coordinates: '14.7833,-15.9167',
        facts: [
          'Has water system',
          'Has electricity',
          'Infrastructure expertise',
          'Cement available'
        ]
      },
      {
        name: 'Bambey',
        location: 'Diourbel Region, Senegal',
        coordinates: '14.7000,-16.4500',
        facts: [
          'Has solar installation',
          'Has plumbers',
          'Research center',
          'Agricultural machinery'
        ]
      },

      // Villages with mixed needs
      {
        name: 'Ndioum',
        location: 'Saint-Louis Region, Senegal',
        coordinates: '16.7000,-14.7167',
        facts: ['Need medicine', 'Need seeds', 'Has radio', 'Date production']
      },
      {
        name: 'Thilogne',
        location: 'Matam Region, Senegal',
        coordinates: '15.7333,-13.3167',
        facts: [
          'Need doctors',
          'Need water',
          'Migration issues',
          'Has diaspora support'
        ]
      },
      {
        name: 'Goudiry',
        location: 'Tambacounda Region, Senegal',
        coordinates: '14.1833,-12.7167',
        facts: [
          'Need food',
          'Need medical care',
          'Transport hub',
          'Livestock market'
        ]
      },
      {
        name: 'Saraya',
        location: 'Kedougou Region, Senegal',
        coordinates: '12.8167,-11.2667',
        facts: [
          'Need school',
          'Need clinic',
          'Gold resources',
          'Tourism potential'
        ]
      },

      // Villages with mixed resources
      {
        name: 'Rufisque',
        location: 'Dakar Region, Senegal',
        coordinates: '14.7167,-17.2667',
        facts: [
          'Has medical staff',
          'Has food supplies',
          'Port facilities',
          'Industrial area'
        ]
      },
      {
        name: 'Pikine',
        location: 'Dakar Region, Senegal',
        coordinates: '14.7500,-17.4000',
        facts: [
          'Has teachers',
          'Has market',
          'Large population',
          'Trade center'
        ]
      },
      {
        name: 'Guediawaye',
        location: 'Dakar Region, Senegal',
        coordinates: '14.7833,-17.4167',
        facts: [
          'Has health center',
          'Has schools',
          'Urban services',
          'Youth programs'
        ]
      },

      // Remote villages with urgent needs
      {
        name: 'Koumpentoum',
        location: 'Tambacounda Region, Senegal',
        coordinates: '13.9833,-14.5500',
        facts: [
          'Need everything',
          'Very remote',
          'Need emergency help',
          'Has community spirit'
        ]
      },
      {
        name: 'Dialacoto',
        location: 'Kedougou Region, Senegal',
        coordinates: '12.7667,-12.2500',
        facts: [
          'Need medical urgently',
          'Need food',
          'Isolated location',
          'Has mine workers'
        ]
      },
      {
        name: 'Bandafassi',
        location: 'Kedougou Region, Senegal',
        coordinates: '12.5333,-12.4667',
        facts: [
          'Need supplies',
          'Need transport',
          'Mountain village',
          'Traditional culture'
        ]
      },
      {
        name: 'Dabo',
        location: 'Kedougou Region, Senegal',
        coordinates: '12.7000,-12.1333',
        facts: [
          'Need medical clinic',
          'Need school',
          'Forest area',
          'Eco-tourism potential'
        ]
      },

      // Villages with specific skills
      {
        name: 'Toubab Dialaw',
        location: 'Thiès Region, Senegal',
        coordinates: '14.5667,-17.1167',
        facts: [
          'Has artisans',
          'Has craft center',
          'Tourism services',
          'Beach access'
        ]
      },
      {
        name: 'Nguekokh',
        location: 'Thiès Region, Senegal',
        coordinates: '14.5167,-16.9500',
        facts: [
          'Has carpenters',
          'Has mechanics',
          'Workshop available',
          'Technical skills'
        ]
      },
      {
        name: 'Pout',
        location: 'Thiès Region, Senegal',
        coordinates: '14.7667,-17.0667',
        facts: [
          'Has cement factory',
          'Has construction workers',
          'Industrial skills',
          'Building materials'
        ]
      },
      {
        name: 'Khombole',
        location: 'Thiès Region, Senegal',
        coordinates: '14.7667,-16.7167',
        facts: [
          'Has weavers',
          'Has traditional crafts',
          'Cultural knowledge',
          'Textile production'
        ]
      },
      {
        name: 'Mekhe',
        location: 'Thiès Region, Senegal',
        coordinates: '15.1167,-16.6167',
        facts: [
          'Has farmers',
          'Has agricultural expertise',
          'Training available',
          'Modern techniques'
        ]
      },
      {
        name: 'Kayar',
        location: 'Thiès Region, Senegal',
        coordinates: '14.9167,-17.1167',
        facts: [
          'Has fishermen',
          'Has boats',
          'Fish processing',
          'Coastal expertise'
        ]
      },
      {
        name: 'Notto Diobass',
        location: 'Thiès Region, Senegal',
        coordinates: '14.5500,-16.5333',
        facts: [
          'Has tailors',
          'Has sewing machines',
          'Fashion skills',
          'Training center'
        ]
      }
    ];

    console.log(`Creating ${villages.length} village profiles...`);

    for (const village of villages) {
      const created = await prisma.user.create({
        data: village
      });
      console.log(`Created: ${created.name}`);
    }

    console.log(
      `\n✅ Successfully created ${villages.length} Senegalese village profiles!`
    );
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
