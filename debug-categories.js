const ingredients = [
  { id: '1', name: 'Apple', category: 'FRUITS' },
  { id: '2', name: 'ss1 prod', category: 'SS1' },
];

let activeCategory = 'ss1';

const filtered = (activeCategory === 'ALL'
  ? ingredients
  : ingredients.filter((i) => i.category.toLowerCase() === activeCategory.toLowerCase())
);

console.log('Filtered for ss1:', filtered);

activeCategory = 'FRUITS';
console.log('Filtered for FRUITS:', (activeCategory === 'ALL'
  ? ingredients
  : ingredients.filter((i) => i.category.toLowerCase() === activeCategory.toLowerCase())
));
