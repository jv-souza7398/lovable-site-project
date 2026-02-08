import React, { useContext, useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import classes from './DrinkDetailsModal.module.css';

const CharacteristicCircles = ({ label, level, max = 5 }) => {
  return (
    <div className={classes.characteristicRow}>
      <span className={classes.characteristicLabel}>{label}</span>
      <div className={classes.circles}>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`${classes.circle} ${i < level ? classes.filled : classes.empty}`}
          />
        ))}
      </div>
    </div>
  );
};

const DrinkDetailsModal = ({ drink, isOpen, onClose }) => {
  const { addDrinkToCart, isDrinkInCart } = useContext(CartContext);
  const isInCart = drink ? isDrinkInCart(drink.id) : false;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !drink) return null;

  const handleAdd = () => {
    if (!isInCart) {
      addDrinkToCart(drink);
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      const videoId = match[1];
      // rel=0: disable external recommendations
      // modestbranding=1: minimal YouTube branding
      // loop=1 + playlist: auto-replay the same video
      // showinfo=0: hide video title (deprecated but still helps)
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&loop=1&playlist=${videoId}&showinfo=0`;
    }
    return url;
  };

  const embedUrl = getYouTubeEmbedUrl(drink.videoUrl);

  return (
    <div className={classes.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header with close button */}
        <div className={classes.modalHeader}>
          <button
            className={classes.headerCloseBtn}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} color="#b78f3f" />
          </button>
        </div>

        <div className={classes.content}>
          {/* Left side - Video */}
          <div className={classes.videoSection}>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`Vídeo de ${drink.title}`}
                className={classes.video}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className={classes.videoPlaceholder}>
                <img src={drink.img} alt={drink.title} className={classes.placeholderImage} />
                <span>Vídeo em breve</span>
              </div>
            )}
          </div>

          {/* Right side - Details */}
          <div className={classes.detailsSection}>
            <h2 className={classes.title}>DETALHES DO DRINK</h2>
            <h3 className={classes.drinkName}>{drink.title}</h3>

            {drink.descricao && (
              <p className={classes.description}>{drink.descricao}</p>
            )}

            <div className={classes.characteristics}>
              {drink.caracteristicas?.map((char, index) => (
                <CharacteristicCircles
                  key={index}
                  label={char.nome}
                  level={char.nivel}
                  max={char.max || 5}
                />
              ))}
            </div>

            {drink.ingredientes && drink.ingredientes.length > 0 && (
              <div className={classes.ingredients}>
                <h4>Ingredientes</h4>
                <ul>
                  {drink.ingredientes.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className={`${classes.addButton} ${isInCart ? classes.addedDisabled : ''}`}
              onClick={handleAdd}
              disabled={isInCart}
            >
              {isInCart ? <Check size={20} /> : <Plus size={20} />}
              <span>{isInCart ? '✓ No Carrinho' : 'Adicionar ao Carrinho'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrinkDetailsModal;
