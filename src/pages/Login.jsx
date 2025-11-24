import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import classes from './Login.module.css';
import { supabase } from '../integrations/supabase/client';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaVenusMars, FaCalendar } from 'react-icons/fa';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Verifica se o usuário já está logado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(redirectTo);
      }
    };
    checkUser();
  }, [navigate, redirectTo]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginSenha,
      });

      if (error) throw error;

      navigate(redirectTo);
    } catch (error) {
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!cpf || !nomeCompleto || !email || !senha || !sexo || !telefone || !dataNascimento) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            cpf,
            nome_completo: nomeCompleto,
            email,
            sexo,
            telefone,
            data_nascimento: dataNascimento,
          }
        }
      });

      if (error) throw error;

      alert('Conta criada com sucesso!');
      navigate(redirectTo);
    } catch (error) {
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
      console.error('Erro no cadastro:', error);
    } finally {
      setLoading(false);
    }
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

            {error && <p className={classes.error}>{error}</p>}

            <div className={classes.inputGroup}>
              <FaEnvelope className={classes.icon} />
              <input
                type="email"
                placeholder="E-mail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <button type="submit" className={classes.submitButton} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
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

            {error && <p className={classes.error}>{error}</p>}

            <div className={classes.inputGroup}>
              <FaUser className={classes.icon} />
              <input
                type="text"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCPF(e.target.value)}
                required
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className={classes.inputGroup}>
              <FaVenusMars className={classes.icon} />
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                required
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <button type="submit" className={classes.submitButton} disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
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
