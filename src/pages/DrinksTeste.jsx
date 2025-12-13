import React from 'react';
import classes from './DrinksTeste.module.css';
import drink8 from '../assets/drink8.jpg';
import drink9 from '../assets/drink9.jpg';
import drink10 from '../assets/drink10.jpg';
import drink11 from '../assets/drink11.jpg';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '../components/ui/carousel';

const drinksSemAlcool = [
  { id: 1, img: drink10, title: "Mocktail Tropical", description: "Refrescante e saboroso" },
  { id: 2, img: drink11, title: "Virgin Mojito", description: "Clássico sem álcool" },
  { id: 3, img: drink8, title: "Fruit Punch", description: "Mix de frutas tropicais" },
  { id: 4, img: drink9, title: "Lemonade Especial", description: "Limonada premium" },
  { id: 5, img: drink10, title: "Smoothie Mix", description: "Vitaminas naturais" },
  { id: 6, img: drink11, title: "Mocktail Sunset", description: "Visual impressionante" },
  { id: 7, img: drink8, title: "Chá Gelado Premium", description: "Infusão especial" },
];

const drinksPadroes = [
  { id: 1, img: drink8, title: "Caipirinha Clássica", description: "Tradição brasileira" },
  { id: 2, img: drink9, title: "Mojito", description: "Refrescante cubano" },
  { id: 3, img: drink10, title: "Margarita", description: "Clássico mexicano" },
  { id: 4, img: drink11, title: "Moscow Mule", description: "Vodka e gengibre" },
  { id: 5, img: drink8, title: "Gin Tônica", description: "Elegância britânica" },
  { id: 6, img: drink9, title: "Whisky Sour", description: "Sofisticado" },
  { id: 7, img: drink10, title: "Negroni", description: "Italiano autêntico" },
];

const DrinkCard = ({ item }) => (
  <div className={classes.drinkCard}>
    <img src={item.img} alt={item.title} />
    <h2>{item.title}</h2>
    <p>{item.description}</p>
  </div>
);

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
