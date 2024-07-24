import React, { useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Import SVGs
import alcoholBeverage from '../assets/svgs/alcohol-beverage-drink-svgrepo-com.svg';
import bakeryBread1 from '../assets/svgs/bakery-bread-breakfast-2-svgrepo-com.svg';
import bakeryBread2 from '../assets/svgs/bakery-bread-breakfast-svgrepo-com.svg';
import bakeryCake from '../assets/svgs/bakery-cake-dessert-svgrepo-com.svg';
import barbecue from '../assets/svgs/barbecue-barbeque-bbq-svgrepo-com.svg';
import beerBottle from '../assets/svgs/beer-beverage-bottle-svgrepo-com.svg';
import beerCold1 from '../assets/svgs/beer-beverage-cold-2-svgrepo-com.svg';
import beerCold2 from '../assets/svgs/beer-beverage-cold-svgrepo-com.svg';
import beverageBreakfast1 from '../assets/svgs/beverage-breakfast-drink-2-svgrepo-com.svg';
import beverageBreakfast2 from '../assets/svgs/beverage-breakfast-drink-svgrepo-com.svg';
import coffeeCup1 from '../assets/svgs/beverage-coffee-cup-2-svgrepo-com.svg';
import coffeeCup2 from '../assets/svgs/beverage-coffee-cup-svgrepo-com.svg';
import cupDrink from '../assets/svgs/beverage-cup-drink-svgrepo-com.svg';
import bowlFood from '../assets/svgs/bowl-food-foods-svgrepo-com.svg';
import breakfastDessert from '../assets/svgs/breakfast-dessert-food-svgrepo-com.svg';
import burgerFastFood from '../assets/svgs/burger-fast-food-svgrepo-com.svg';
import cakeCupDessert from '../assets/svgs/cake-cup-dessert-svgrepo-com.svg';
import candyDessertFood from '../assets/svgs/candy-dessert-food-svgrepo-com.svg';
import coldDessert from '../assets/svgs/cold-dessert-food-svgrepo-com.svg';
import donutDoughnut from '../assets/svgs/dessert-donut-doughnut-svgrepo-com.svg';
import dinnerFood from '../assets/svgs/dinner-food-foods-svgrepo-com.svg';
import italianFood from '../assets/svgs/food-foods-italian-svgrepo-com.svg';
import japaneseFood from '../assets/svgs/food-foods-japanese-svgrepo-com.svg';

const categories = [
  { label: 'All', icon: alcoholBeverage },
  { label: 'Italian', icon: italianFood },
  { label: 'Burger', icon: burgerFastFood },
  { label: 'Bread 1', icon: bakeryBread1 },
  { label: 'Bread 2', icon: bakeryBread2 },
  { label: 'Cake', icon: bakeryCake },
  { label: 'Barbecue', icon: barbecue },
  { label: 'Bottle', icon: beerBottle },
  { label: 'Cold 1', icon: beerCold1 },
  { label: 'Cold 2', icon: beerCold2 },
  { label: 'Breakfast 1', icon: beverageBreakfast1 },
  { label: 'Breakfast 2', icon: beverageBreakfast2 },
  { label: 'Coffee Cup 1', icon: coffeeCup1 },
  { label: 'Coffee Cup 2', icon: coffeeCup2 },
  { label: 'Cup Drink', icon: cupDrink },
  { label: 'Bowl', icon: bowlFood },
  { label: 'Dessert', icon: breakfastDessert },
  { label: 'Dessert', icon: cakeCupDessert },
  { label: 'Candy Dessert', icon: candyDessertFood },
  { label: 'Cold Dessert', icon: coldDessert },
  { label: 'Donut Doughnut', icon: donutDoughnut },
  { label: 'Dinner Food', icon: dinnerFood },
  { label: 'Japanese Food', icon: japaneseFood },
];

const CategorySelector = ({ onSelectCategory }) => {
  const scrollRef = useRef(null);

  const handleScrollLeft = () => {
    scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <Box display="flex" alignItems="center" className="category-selector-container">
      <IconButton onClick={handleScrollLeft} className="custom-arrow">
        <img src={require('../assets/svgs/left-arrow.svg').default} alt="Left Arrow" />
      </IconButton>
      <Box display="flex" overflow="hidden" ref={scrollRef} className="category-selector">
        {categories.map((category, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            marginX={2}
            onClick={() => {
              console.log(`Selected category: ${category.label}`);
              onSelectCategory(category.label);
            }}
            className="category-item"
          >
            <img src={category.icon} alt={category.label} className="category-icon" />
            <Typography variant="caption">{category.label}</Typography>
          </Box>
        ))}
      </Box>
      <IconButton onClick={handleScrollRight} className="custom-arrow">
        <img src={require('../assets/svgs/right-arrow.svg').default} alt="Right Arrow" />
      </IconButton>
    </Box>
  );
};

export default CategorySelector;
