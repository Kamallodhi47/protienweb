const ingredients = [
  { name: 'Apple', category: 'FRUITS' },
  { name: 'Banana', category: 'FRUITS' },
  { name: 'Sprout', category: 'SPROUTS' },
  { name: 'Nimbu', category: 'SEASONINGS' },
];

const activeCategory = 'FRUITS';

const isSeasoning = (i) => i.category === 'SEASONINGS' || i.name.toLowerCase().includes('nimbu');

const filteredIngredients = (activeCategory === 'ALL'
  ? ingredients
  : ingredients.filter((i) => (i.category || '').toLowerCase() === (activeCategory || '').toLowerCase())
).filter((i) => !isSeasoning(i));

console.log(filteredIngredients);
