
import drink3 from '../assets/drink3.jpeg';
import drink2 from '../assets/drink2.webp';
import drink1 from '../assets/drink1.jpeg';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './images.css';  // Importe o arquivo CSS para o slider

const images = [
  { url: drink1, content: 'Your overlay content 1' },
  { url: drink2, content: 'Your overlay content 2' },
  { url: drink3, content: 'Your overlay content 3' }
];

const ImageSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <Slider {...settings}>
      {images.map((image, index) => (
        <div key={index} className="slider-container">
          <div
            className="slider-item"
            style={{ backgroundImage: `url(${image.url})` }}
          >
            <div className="overlay-content">
              <h2>{image.content}</h2>
              {/* Adicione mais elementos conforme necessário */}
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default ImageSlider;
