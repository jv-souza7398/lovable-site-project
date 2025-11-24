import React, { useState, useEffect } from 'react';
import classes from './Account.module.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

function Account() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/Login/');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        navigate('/Login/');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/Login/');
  };

  if (loading) {
    return <div className={classes.loading}>Carregando...</div>;
  }

  if (!profile) {
    return null;
  }
  return (
    <>
      <main className={classes.mainAccount}>
        <div className={classes.navAccount}>
          <h1>MINHA CONTA</h1>      
        </div>
        <div className={classes.accountTitle} data-aos="fade-up">
          <h1>Minha Conta <span>________</span></h1>
        </div>
        
        <section className={classes.accountSection}>
          <aside className={classes.accountAside}>     
            <figure>
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                alt="avatar"
              />
              <figcaption>
                <h1>Olá {profile.nome_completo}</h1>
                <p>Bay Area, San Francisco, CA</p>
                <button onClick={handleLogout} className={classes.logoutButton}>
                  Sair da conta
                </button>
              </figcaption>
            </figure>
          </aside>
      
          <section className={classes.infoSection}>
            <article className={classes.infoArticle}>
              <h2>INFORMAÇÕES PESSOAIS</h2>
              <dl>
                <div className={classes.flexRow}>
                  <dt>Nome Completo</dt>
                  <dd>{profile.nome_completo}</dd>
                </div>
                
                <div className={classes.flexRow}>
                  <dt>CPF</dt>
                  <dd>{profile.cpf}</dd>
                </div>
                
                <div className={classes.flexRow}>
                  <dt>Sexo</dt>
                  <dd>{profile.sexo}</dd>
                </div>
                
                <div className={classes.flexRow}>
                  <dt>Email</dt>
                  <dd>{profile.email}</dd>
                </div>
                
                <div className={classes.flexRow}>
                  <dt>Telefone</dt>
                  <dd>{profile.telefone}</dd>
                </div>
                
                <div className={classes.flexRow}>
                  <dt>Data De Nascimento</dt>
                  <dd>{new Date(profile.data_nascimento).toLocaleDateString('pt-BR')}</dd>
                </div>
                
                <div className={classes.flexRow}>
                  <dt>Endereço</dt>
                  <dd>Bay Area, San Francisco, CA</dd>
                </div>
              </dl>
            </article>
          </section>
        </section>
      </main>
    </>
  )
}

export default Account