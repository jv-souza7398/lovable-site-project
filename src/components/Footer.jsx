import classes from './Footer.module.css'

import { Link } from 'react-router-dom'
import logo from '../assets/Vincci.jpg'

function Footer() {
  return (
    <footer className={classes.footer}>
      <div className={classes.containerContatos}>
        <div className={classes.Imglogo}>
          <Link to="/"><img src={logo} alt="Vincci Pub" /></Link>
        </div>
        <div className={classes.pagina}>
          <h4>PÁGINAS</h4>
          <div className={classes.ContatosLinks}>
            <Link to="/">Home</Link>  
            <Link to="/sobre/">Sobre</Link>  
            <Link to="/Orçamento-Eventos/">Orçamento</Link>  
          </div>
        </div>
        <div className={classes.LinkUtil}>
          <h4>LINKS ÚTEIS</h4>
          <div className={classes.ContatosLinks}>
            <Link to="/Politica-Privacidade/">Política e Privacidade</Link>  
            <Link to="/fale-conosco/">SAC</Link>  
            <Link to="/fale-conosco/">Fale conosco</Link>  
          </div>
        </div>
        <div className={classes.redesSociais}>
          <h4>REDES SOCIAIS</h4>
          <ul className={classes.socialLinks}>
            <li><a href="#"><i className="fa-brands fa-instagram"></i> Instagram</a></li>
            <li><a href="#"><i className="fa-brands fa-facebook-f"></i> Facebook</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer