import { Link, useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import classes from './NavBar.module.css'
import { AccountContext } from '../contexts/AccountContext'
import { CartContext } from '../contexts/CartContext'
import { ChevronDown } from 'lucide-react'

import logo from '../assets/logo-vincci-new.png'

function Navbar() {
  const navigate = useNavigate();
  const { AccountItems } = useContext(AccountContext);
  const { getTotalDrinkCount } = useContext(CartContext);
  const totalDrinks = getTotalDrinkCount ? getTotalDrinkCount() : 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const handleAccountClick = (e) => {
    e.preventDefault();
    
    // Verifica se o usuário está logado
    if (AccountItems && AccountItems.length > 0) {
      navigate('/Minha-Conta/');
    } else {
      navigate('/Login/');
    }
  };

  return (
    <div className={classes.content}>   
      <nav className={classes.navbarContent}>
        <div className={classes.logo}>
          <Link to="/"><img src={logo} alt="Vincci Bar" /></Link>
        </div>

        {/* Botão Hambúrguer */}
        <button 
          className={classes.hamburger} 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={menuOpen ? classes.open : ''}></span>
          <span className={menuOpen ? classes.open : ''}></span>
          <span className={menuOpen ? classes.open : ''}></span>
        </button>

        {/* Menu Desktop */}
        <div className={classes.navItens}>
          <ul>
            <Link to={"#"}><i className="bi bi-search"></i></Link>
            <li><Link to={"/"}>HOME</Link></li>
            <li><Link to={"/drinks/"}>DRINKS</Link></li>
            <li 
              className={classes.dropdownContainer}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <span className={classes.dropdownTrigger}>
                SAIBA MAIS <ChevronDown size={16} className={`${classes.chevron} ${dropdownOpen ? classes.chevronOpen : ''}`} />
              </span>
              <div className={`${classes.dropdown} ${dropdownOpen ? classes.dropdownVisible : ''}`}>
                <Link to={"/sobre/"}>SOBRE NÓS</Link>
                <Link to={"/fale-conosco/"}>FALE CONOSCO</Link>
              </div>
            </li>
          </ul>
        </div> 

        {/* Ícones Desktop */}
        <div className={classes.servicos}>
          <a href="#" onClick={handleAccountClick}><i className="bi bi-person"></i></a>
          <Link to={"/Carrinho/"} className={classes.cartWrapper}>
            <i className="bi bi-cart"></i>
            {totalDrinks > 0 && <span className={classes.cartBadge}>{totalDrinks}</span>}
          </Link>
        </div>


        {/* Overlay Mobile */}
        {menuOpen && (
          <div 
            className={classes.overlay} 
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Menu Mobile */}
        <div className={`${classes.mobileMenu} ${menuOpen ? classes.mobileMenuOpen : ''}`}>
          <ul>
            <li><Link to={"/"} onClick={() => setMenuOpen(false)}>HOME</Link></li>
            <li><Link to={"/drinks/"} onClick={() => setMenuOpen(false)}>DRINKS</Link></li>
            <li 
              className={classes.mobileDropdownContainer}
              onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
            >
              <span className={classes.mobileDropdownTrigger}>
                SAIBA MAIS <ChevronDown size={16} className={`${classes.chevron} ${mobileDropdownOpen ? classes.chevronOpen : ''}`} />
              </span>
              <div className={`${classes.mobileDropdown} ${mobileDropdownOpen ? classes.mobileDropdownVisible : ''}`}>
                <Link to={"/sobre/"} onClick={() => setMenuOpen(false)}>SOBRE NÓS</Link>
                <Link to={"/fale-conosco/"} onClick={() => setMenuOpen(false)}>FALE CONOSCO</Link>
              </div>
            </li>
            <li>
              <a href="#" onClick={(e) => { handleAccountClick(e); setMenuOpen(false); }}>
                <i className="bi bi-person"></i> MINHA CONTA
              </a>
            </li>
            <li>
              <Link to={"/Carrinho/"} onClick={() => setMenuOpen(false)} className={classes.cartWrapper}>
                <i className="bi bi-cart"></i> CARRINHO
                {totalDrinks > 0 && <span className={classes.cartBadge}>{totalDrinks}</span>}
              </Link>
            </li>

          </ul>
        </div>
      </nav>
    </div>
  )
}

export default Navbar