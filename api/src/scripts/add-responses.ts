import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample French responses based on village capabilities
const responses = {
  medical: [
    "Nous pouvons vous aider avec des fournitures médicales et des soins de santé.",
    "Notre village a des médecins et des infirmières disponibles pour vous aider.",
    "Nous avons des médicaments et du matériel médical à partager.",
    "Notre équipe médicale peut vous assister immédiatement."
  ],
  education: [
    "Nous avons des enseignants et du matériel éducatif disponibles.",
    "Notre village peut fournir des livres et des ressources scolaires.",
    "Nous pouvons envoyer des professeurs pour aider votre communauté.",
    "Nous avons une bibliothèque avec de nombreuses ressources éducatives."
  ],
  agriculture: [
    "Nous pouvons partager nos semences et nos outils agricoles.",
    "Notre village a de l'expérience en agriculture et peut vous conseiller.",
    "Nous avons des machines agricoles que nous pouvons prêter.",
    "Nos agriculteurs peuvent vous aider à améliorer vos récoltes."
  ],
  water: [
    "Nous pouvons vous aider avec l'accès à l'eau potable.",
    "Notre village a des systèmes de purification d'eau à partager.",
    "Nous avons des puits et des pompes disponibles.",
    "Nous pouvons installer des systèmes d'irrigation dans votre région."
  ],
  technology: [
    "Nous avons des équipements technologiques et de communication disponibles.",
    "Notre village peut fournir de l'accès internet et des ordinateurs.",
    "Nous pouvons installer des systèmes solaires et de communication.",
    "Nous avons des techniciens qui peuvent vous aider."
  ],
  construction: [
    "Nous avons des matériaux de construction et des outils disponibles.",
    "Notre village peut envoyer des ouvriers pour vous aider.",
    "Nous pouvons fournir du ciment, des briques et des outils.",
    "Nos constructeurs peuvent vous aider à bâtir ce dont vous avez besoin."
  ],
  food: [
    "Nous pouvons partager notre nourriture et nos provisions.",
    "Notre village a des surplus de céréales et de légumes.",
    "Nous avons de la nourriture stockée que nous pouvons envoyer.",
    "Nos réserves alimentaires sont disponibles pour vous aider."
  ],
  general: [
    "Nous sommes prêts à vous aider avec ce que nous avons.",
    "Notre communauté peut vous soutenir dans vos besoins.",
    "Nous pouvons coordonner une aide pour votre village.",
    "Contactez-nous pour discuter de comment nous pouvons aider."
  ]
};

function getRandomResponse(category: string): string {
  const categoryResponses = responses[category as keyof typeof responses] || responses.general;
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

function determineCategory(facts: string[]): string {
  const factsLower = facts.join(' ').toLowerCase();
  
  if (factsLower.includes('medical') || factsLower.includes('health') || factsLower.includes('doctor') || factsLower.includes('hospital')) {
    return 'medical';
  }
  if (factsLower.includes('education') || factsLower.includes('school') || factsLower.includes('teacher') || factsLower.includes('learning')) {
    return 'education';
  }
  if (factsLower.includes('agriculture') || factsLower.includes('farm') || factsLower.includes('crop') || factsLower.includes('seed')) {
    return 'agriculture';
  }
  if (factsLower.includes('water') || factsLower.includes('well') || factsLower.includes('irrigation')) {
    return 'water';
  }
  if (factsLower.includes('technology') || factsLower.includes('computer') || factsLower.includes('internet') || factsLower.includes('solar')) {
    return 'technology';
  }
  if (factsLower.includes('construction') || factsLower.includes('build') || factsLower.includes('tool')) {
    return 'construction';
  }
  if (factsLower.includes('food') || factsLower.includes('grain') || factsLower.includes('meal')) {
    return 'food';
  }
  
  return 'general';
}

async function addResponses() {
  try {
    console.log('Fetching all villages...');
    const villages = await prisma.user.findMany();
    
    console.log(`Found ${villages.length} villages. Adding French responses...`);
    
    for (const village of villages) {
      const category = determineCategory(village.facts);
      const response = getRandomResponse(category);
      
      await prisma.user.update({
        where: { id: village.id },
        data: { response }
      });
      
      console.log(`✓ ${village.name}: ${response}`);
    }
    
    console.log('\n✅ All villages updated successfully!');
  } catch (error) {
    console.error('Error updating villages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addResponses();
