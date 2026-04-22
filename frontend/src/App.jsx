// Ambiente de testes DeskHub: front-end preparado para estudos de QA, com comportamentos intencionais para validacao.
import { useEffect, useState } from 'react';

const STORAGE_TOKEN_KEY = 'deskhub_token';
const STORAGE_USER_KEY = 'deskhub_user';

const getTodayString = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const initialAuthForm = {
  name: '',
  email: '',
  password: '',
};

const initialReservationForm = {
  deskId: '1',
  startTime: '09:00',
  endTime: '14:00',
};

const getStoredUser = () => {
  const rawUser = localStorage.getItem(STORAGE_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    localStorage.removeItem(STORAGE_USER_KEY);
    return null;
  }
};

function App() {
  const [mode, setMode] = useState('login');
  const [activeView, setActiveView] = useState('desks');
  const [token, setToken] = useState(localStorage.getItem(STORAGE_TOKEN_KEY) ?? '');
  const [user, setUser] = useState(getStoredUser);
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [reservationForm, setReservationForm] = useState(initialReservationForm);
  const [desks, setDesks] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [submittingReservation, setSubmittingReservation] = useState(false);
  const [removingReservationId, setRemovingReservationId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const setSession = (sessionToken, sessionUser) => {
    setToken(sessionToken);
    setUser(sessionUser);
    localStorage.setItem(STORAGE_TOKEN_KEY, sessionToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(sessionUser));
  };

  const clearSession = () => {
    setToken('');
    setUser(null);
    setActiveView('desks');
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setDesks([]);
    setMyReservations([]);
  };

  const apiRequest = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api${path}`, {
      ...options,
      headers,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || 'Nao foi possivel concluir a solicitacao.');
    }

    return payload;
  };

  const loadWorkspaceData = async (dateToLoad = selectedDate) => {
    setLoadingDashboard(true);

    try {
      const [desksResponse, reservationsResponse] = await Promise.all([
        apiRequest(`/desks?date=${dateToLoad}`),
        apiRequest('/reservations/my'),
      ]);

      setDesks(desksResponse.desks);
      setMyReservations(reservationsResponse.reservations);
      setFeedback({ type: '', message: '' });

      if (desksResponse.desks.length > 0) {
        setReservationForm((currentForm) => ({
          ...currentForm,
          deskId: desksResponse.desks.some(
            (desk) => String(desk.id) === currentForm.deskId,
          )
            ? currentForm.deskId
            : String(desksResponse.desks[0].id),
        }));
      }
    } catch (error) {
      if (error.message.toLowerCase().includes('token')) {
        clearSession();
      }

      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadWorkspaceData(selectedDate);
  }, [selectedDate, token]);

  const handleAuthFieldChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleReservationFieldChange = (event) => {
    const { name, value } = event.target;
    setReservationForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setLoadingAuth(true);
    setFeedback({ type: '', message: '' });

    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const body =
        mode === 'register'
          ? authForm
          : { email: authForm.email, password: authForm.password };

      const payload = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setSession(payload.token, payload.user);
      setAuthForm(initialAuthForm);
      setFeedback({
        type: 'success',
        message:
          mode === 'register'
            ? 'Conta criada e sessao iniciada com sucesso.'
            : 'Login realizado com sucesso.',
      });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleReservationSubmit = async (event) => {
    event.preventDefault();
    setSubmittingReservation(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = await apiRequest('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          ...reservationForm,
          date: selectedDate,
        }),
      });

      setFeedback({ type: 'success', message: payload.message });
      await loadWorkspaceData(selectedDate);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setSubmittingReservation(false);
    }
  };

  const handleReservationRemoval = async (reservationId) => {
    const confirmed = window.confirm(
      'Deseja remover esta reserva? Esta acao nao pode ser desfeita.',
    );

    if (!confirmed) {
      return;
    }

    setRemovingReservationId(reservationId);
    setFeedback({ type: '', message: '' });

    try {
      const payload = await apiRequest(`/reservations/${reservationId}`, {
        method: 'DELETE',
      });

      setFeedback({ type: 'success', message: payload.message });
      await loadWorkspaceData(selectedDate);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setRemovingReservationId(null);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFeedback({ type: '', message: '' });
  };

  if (!token || !user) {
    return (
      <main className="shell auth-shell">
        <section className="hero-panel">
          <span className="eyebrow">DeskHub</span>
          <h1>Organize a rotina do escritorio sem perder tempo com combinados soltos.</h1>
          <p>
            Veja a ocupacao do dia, escolha uma mesa em segundos e acompanhe suas
            reservas em um fluxo simples pensado para validacao funcional.
          </p>
          <div className="hero-grid">
            <article className="hero-card accent">
              <strong>Painel diario</strong>
              <p>Consulte rapidamente quais mesas estao livres ou ocupadas em cada data.</p>
            </article>
            <article className="hero-card">
              <strong>Reserva direta</strong>
              <p>Escolha mesa, horario de entrada e saida sem depender de planilhas externas.</p>
            </article>
            <article className="hero-card">
              <strong>Area pessoal</strong>
              <p>Entre no seu perfil para revisar e cancelar reservas quando precisar.</p>
            </article>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-tabs">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
              type="button"
            >
              Entrar
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
              type="button"
            >
              Criar conta
            </button>
          </div>

          <form className="card auth-card" onSubmit={handleAuthSubmit}>
            <h2>{mode === 'register' ? 'Crie seu acesso' : 'Acesse a plataforma'}</h2>
            <p>
              {mode === 'register'
                ? 'Preencha seus dados para reservar mesas.'
                : 'Entre para consultar disponibilidade e registrar reservas.'}
            </p>

            {mode === 'register' && (
              <label>
                <span>Nome</span>
                <input
                  name="name"
                  onChange={handleAuthFieldChange}
                  placeholder="Ex: Marina Costa"
                  required
                  value={authForm.name}
                />
              </label>
            )}

            <label>
              <span>E-mail</span>
              {/* BUG PROPOSITAL: o campo usa texto simples e nao valida formato de e-mail. */}
              <input
                name="email"
                onChange={handleAuthFieldChange}
                placeholder="Digite qualquer texto"
                required
                type="text"
                value={authForm.email}
              />
            </label>

            <label>
              <span>Senha</span>
              <input
                name="password"
                onChange={handleAuthFieldChange}
                placeholder="Sua senha"
                required
                type="password"
                value={authForm.password}
              />
            </label>

            {feedback.message && !token && (
              <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
            )}

            <button className="primary-button" disabled={loadingAuth} type="submit">
              {loadingAuth
                ? 'Processando...'
                : mode === 'register'
                  ? 'Criar conta'
                  : 'Entrar'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="shell dashboard-shell">
      <header className="topbar">
        <div className="topbar-title">
          <span className="eyebrow">DeskHub</span>
          <h1>Painel de reservas</h1>
        </div>

        <div className="topbar-actions">
          <nav className="view-switcher">
            <button
              className={activeView === 'desks' ? 'active' : ''}
              onClick={() => setActiveView('desks')}
              type="button"
            >
              Mesas
            </button>
            <button
              className={activeView === 'profile' ? 'active' : ''}
              onClick={() => setActiveView('profile')}
              type="button"
            >
              Meu perfil
            </button>
          </nav>

          <div className="welcome-chip">
            <span>{user.name}</span>
            <small>{user.email}</small>
          </div>

          <button className="secondary-button" onClick={clearSession} type="button">
            Sair
          </button>
        </div>
      </header>

      {activeView === 'desks' && (
        <section className="toolbar card">
          <div>
            <h2>Escolha a data da consulta</h2>
            <p>O status das mesas e suas reservas sera atualizado para o dia selecionado.</p>
          </div>

          <label className="date-filter">
            <span>Data</span>
            {/* BUG PROPOSITAL: o seletor nao bloqueia datas no passado. */}
            <input
              onChange={(event) => setSelectedDate(event.target.value)}
              type="date"
              value={selectedDate}
            />
          </label>
        </section>
      )}

      {feedback.message && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}

      {activeView === 'desks' ? (
        <section className="dashboard-grid">
          <article className="card desks-card">
            <div className="section-heading">
              <div>
                <h2>Mesas do dia</h2>
                <p>Visiveis apenas para usuarios autenticados, conforme a regra RN04.</p>
              </div>
              <span className="pill">
                {loadingDashboard ? 'Atualizando...' : `${desks.length} mesas`}
              </span>
            </div>

            <div className="desk-grid">
              {desks.map((desk) => (
                <div className={`desk-item ${desk.status}`} key={desk.id}>
                  <div className="desk-header">
                    <strong>Mesa {desk.number}</strong>
                    <span>{desk.zone}</span>
                  </div>

                  <div className="desk-status">
                    {desk.reservations.length > 0 ? 'Reservada no dia' : 'Livre o dia todo'}
                  </div>

                  <div className="desk-slots">
                    {desk.reservations.length > 0 ? (
                      desk.reservations.map((reservation) => (
                        <div className="slot-chip" key={reservation.id}>
                          {reservation.startTime} - {reservation.endTime} - {reservation.userName}
                        </div>
                      ))
                    ) : (
                      <div className="slot-chip empty">Sem reservas</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="stack-column">
            <article className="card reservation-card">
              <div className="section-heading">
                <div>
                  <h2>Nova reserva</h2>
                  <p>Selecione mesa, data e intervalo dentro do horario permitido.</p>
                </div>
              </div>

              <form className="reservation-form" onSubmit={handleReservationSubmit}>
                <label>
                  <span>Mesa</span>
                  <select
                    name="deskId"
                    onChange={handleReservationFieldChange}
                    value={reservationForm.deskId}
                  >
                    {desks.map((desk) => (
                      <option key={desk.id} value={desk.id}>
                        Mesa {desk.number} - {desk.zone}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Data</span>
                  <input
                    onChange={(event) => setSelectedDate(event.target.value)}
                    type="date"
                    value={selectedDate}
                  />
                </label>

                <div className="time-row">
                  <label>
                    <span>Inicio</span>
                    <input
                      max="18:00"
                      min="08:00"
                      name="startTime"
                      onChange={handleReservationFieldChange}
                      required
                      step="60"
                      type="time"
                      value={reservationForm.startTime}
                    />
                  </label>

                  <label>
                    <span>Fim</span>
                    <input
                      max="18:00"
                      min="08:00"
                      name="endTime"
                      onChange={handleReservationFieldChange}
                      required
                      step="60"
                      type="time"
                      value={reservationForm.endTime}
                    />
                  </label>
                </div>

                <button className="primary-button" disabled={submittingReservation} type="submit">
                  {submittingReservation ? 'Salvando reserva...' : 'Reservar mesa'}
                </button>
              </form>
            </article>

            <article className="card hint-card">
              <div className="section-heading">
                <div>
                  <h2>Acesso rapido</h2>
                  <p>Use o perfil para revisar e cancelar reservas sem misturar tudo na mesma tela.</p>
                </div>
              </div>

              <button
                className="secondary-button wide-button"
                onClick={() => setActiveView('profile')}
                type="button"
              >
                Ir para meu perfil
              </button>
            </article>
          </aside>
        </section>
      ) : (
        <section className="profile-layout">
          <article className="card profile-summary">
            <div className="section-heading">
              <div>
                <h2>Meu perfil</h2>
                <p>Acompanhe suas reservas e remova qualquer uma delas quando precisar.</p>
              </div>
              <span className="pill">{myReservations.length} reservas</span>
            </div>

            <div className="profile-grid">
              <div className="profile-tile">
                <span>Colaborador</span>
                <strong>{user.name}</strong>
              </div>
              <div className="profile-tile">
                <span>Conta</span>
                <strong>{user.email}</strong>
              </div>
              <div className="profile-tile">
                <span>Vista atual</span>
                <strong>Reservas pessoais</strong>
              </div>
            </div>
          </article>

          <article className="card reservation-list-card">
            <div className="section-heading">
              <div>
                <h2>Minhas reservas</h2>
                <p>Lista completa das reservas do usuario logado no estado atual da memoria.</p>
              </div>
            </div>

            <div className="reservation-list">
              {myReservations.length > 0 ? (
                myReservations.map((reservation) => (
                  <div className="reservation-row detailed" key={reservation.id}>
                    <div className="reservation-info">
                      <strong>Mesa {reservation.deskId}</strong>
                      <span>{reservation.date}</span>
                      <small>
                        {reservation.startTime} - {reservation.endTime}
                      </small>
                    </div>

                    <button
                      className="danger-button"
                      disabled={removingReservationId === reservation.id}
                      onClick={() => handleReservationRemoval(reservation.id)}
                      type="button"
                    >
                      {removingReservationId === reservation.id ? 'Removendo...' : 'Remover'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">Voce ainda nao tem reservas cadastradas.</div>
              )}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

export default App;
