import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './Login.module.css';
import { AccountContext } from '../contexts/AccountContext';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaVenusMars, FaCalendar } from 'react-icons/fa';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToAccount, AccountItems } = useContext(AccountContext);

  // Pega o redirectTo do state (se houver)
  const redirectTo = location.state?.redirectTo || '/Minha-Conta/';

  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Estados para cadastro
  const [cpf, setCPF] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Verifica se o usuário existe no AccountItems
    const userExists = AccountItems.find(
      user => user.email === loginEmail
    );

    if (userExists) {
      alert('Login realizado com sucesso!');
      navigate(redirectTo);
    } else {
      alert('Usuário não encontrado. Por favor, crie uma conta.');
      setIsLogin(false);
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (!cpf || !nomeCompleto || !email || !senha || !sexo || !telefone || !dataNascimento) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const itemParaConta = {
      cpf,
      nomeCompleto,
      email,
      sexo,
      telefone,
      dataNascimento,
    };

    addToAccount(itemParaConta);
    alert('Conta criada com sucesso!');
    navigate(redirectTo);
  };

  return (
    <div className={classes.container}>
      <div className={classes.loginBox}>
        <div className={classes.tabs}>
          <button
            className={`${classes.tab} ${isLogin ? classes.active : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`${classes.tab} ${!isLogin ? classes.active : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Criar Conta
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className={classes.form}>
            <h2>Bem-vindo de volta!</h2>
            <p className={classes.subtitle}>Entre com suas credenciais</p>

            <div className={classes.inputGroup}>
              <FaEnvelope className={classes.icon} />
              <input
                type="email"
                placeholder="E-mail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className={classes.inputGroup}>
              <FaLock className={classes.icon} />
              <input
                type="password"
                placeholder="Senha"
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={classes.submitButton}>
              Entrar
            </button>

            <p className={classes.switchText}>
              Não tem uma conta?{' '}
              <span onClick={() => setIsLogin(false)}>Cadastre-se</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleCadastro} className={classes.form}>
            <h2>Criar nova conta</h2>
            <p className={classes.subtitle}>Preencha seus dados</p>

            <div className={classes.inputGroup}>
              <FaUser className={classes.icon} />
              <input
                type="text"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCPF(e.target.value)}
                required
              />
            </div>

            <div className={classes.inputGroup}>
              <FaUser className={classes.icon} />
              <input
                type="text"
                placeholder="Nome Completo"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                required
              />
            </div>

            <div className={classes.inputGroup}>
              <FaEnvelope className={classes.icon} />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={classes.inputGroup}>
              <FaLock className={classes.icon} />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <div className={classes.inputGroup}>
              <FaVenusMars className={classes.icon} />
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                required
              >
                <option value="">Selecione o Sexo</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>

            <div className={classes.inputGroup}>
              <FaPhone className={classes.icon} />
              <input
                type="text"
                placeholder="DDD + Celular"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />
            </div>

            <div className={classes.inputGroup}>
              <FaCalendar className={classes.icon} />
              <input
                type="date"
                placeholder="Data de Nascimento"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={classes.submitButton}>
              Criar Conta
            </button>

            <p className={classes.switchText}>
              Já tem uma conta?{' '}
              <span onClick={() => setIsLogin(true)}>Faça login</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
