import React, { useContext, useState } from 'react';
import classes from './DrinksTeste.module.css';
import drink8 from '../assets/drink8.jpg';
import drink9 from '../assets/drink9.jpg';
import drink10 from '../assets/drink10.jpg';
import drink11 from '../assets/drink11.jpg';
import { CartContext } from '../contexts/CartContext';
import { Plus, Check } from 'lucide-react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '../components/ui/carousel';

const drinksSemAlcool = [
  { id: 'sa-1', img: drink10, title: "Mocktail Tropical", description: "Refrescante e saboroso" },
  { id: 'sa-2', img: drink11, title: "Virgin Mojito", description: "Clássico sem álcool" },
  { id: 'sa-3', img: drink8, title: "Fruit Punch", description: "Mix de frutas tropicais" },
  { id: 'sa-4', img: drink9, title: "Lemonade Especial", description: "Limonada premium" },
  { id: 'sa-5', img: drink10, title: "Smoothie Mix", description: "Vitaminas naturais" },
  { id: 'sa-6', img: drink11, title: "Mocktail Sunset", description: "Visual impressionante" },
  { id: 'sa-7', img: drink8, title: "Chá Gelado Premium", description: "Infusão especial" },
];

const drinksPadroes = [
  { id: 'dp-1', img: drink8, title: "Caipirinha Clássica", description: "Tradição brasileira" },
  { id: 'dp-2', img: drink9, title: "Mojito", description: "Refrescante cubano" },
  { id: 'dp-3', img: drink10, title: "Margarita", description: "Clássico mexicano" },
  { id: 'dp-4', img: drink11, title: "Moscow Mule", description: "Vodka e gengibre" },
  { id: 'dp-5', img: drink8, title: "Gin Tônica", description: "Elegância britânica" },
  { id: 'dp-6', img: drink9, title: "Whisky Sour", description: "Sofisticado" },
  { id: 'dp-7', img: drink10, title: "Negroni", description: "Italiano autêntico" },
];

const DrinkCard = ({ item }) => {
  const { addDrinkToCart } = useContext(CartContext);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addDrinkToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 500);
  };

  return (
    <div className={classes.drinkCard}>
      <img src={item.img} alt={item.title} />
      <h2>{item.title}</h2>
      <p>{item.description}</p>
      <button 
        className={`${classes.addButton} ${added ? classes.added : ''}`}
        onClick={handleAdd}
        aria-label={`Adicionar ${item.title} ao carrinho`}
      >
        {added ? <Check size={16} /> : <Plus size={16} />}
        <span>{added ? 'Adicionado' : 'Adicionar'}</span>
      </button>
    </div>
  );
};

const DrinkCarousel = ({ title, items }) => (
  <div className={classes.carouselSection}>
    <h2 className={classes.categoryTitle}>{title}</h2>
    <div className={classes.carouselWrapper}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className={classes.carousel}
      >
        <CarouselContent className={classes.carouselContent}>
          {items.map((item) => (
            <CarouselItem key={item.id} className={classes.carouselItem}>
              <DrinkCard item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={classes.carouselButton} />
        <CarouselNext className={classes.carouselButton} />
      </Carousel>
    </div>
  </div>
);

function DrinksTeste() {
  return (
    <>
      <div className={classes.navDrinks}>
        <h1>DRINKS - TESTE</h1>
      </div>
      <section className={classes.section}>
        <DrinkCarousel title="DRINKS SEM ÁLCOOL" items={drinksSemAlcool} />
        <DrinkCarousel title="DRINKS PADRÕES" items={drinksPadroes} />
      </section>
    </>
  );
}

export default DrinksTeste;
