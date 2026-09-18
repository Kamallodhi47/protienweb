const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
console.log('contactSubmission in p:', 'contactSubmission' in p);
console.log('newsletterSubscriber in p:', 'newsletterSubscriber' in p);
p.$disconnect();
