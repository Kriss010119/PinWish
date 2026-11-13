import { type FormEvent, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';

type Mode = 'login' | 'register';

const ERR: Record<string, string> = {
  'auth/invalid-email': 'Некорректный email',
  'auth/missing-password': 'Введите пароль',
  'auth/weak-password': 'Пароль слишком короткий (минимум 6 символов)',
  'auth/email-already-in-use': 'Этот email уже зарегистрирован. Попробуйте войти',
  'auth/invalid-credential': 'Неверный email или пароль',
  'auth/user-not-found': 'Пользователь не найден',
  'auth/wrong-password': 'Неверный пароль',
  'auth/too-many-requests': 'Слишком много попыток, попробуйте позже',
  'auth/network-request-failed': 'Нет соединения с сетью',
};

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const showErr = (e: any) => {
    setErr(ERR[e.code] ?? ('Ошибка: ' + (e.message || e.code)));
    setInfo('');
  };
  const switchMode = (m: Mode) => { setMode(m); setErr(''); setInfo(''); };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setInfo('');
    if (mode === 'register' && !name.trim()) { setErr('Введите имя'); return; }
    setBusy(true);
    try {
      if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
    } catch (e) { showErr(e); }
    finally { setBusy(false); }
  };

  const onForgot = async () => {
    setErr(''); setInfo('');
    if (!email.trim()) {
      setErr('Введите email, и мы отправим ссылку для сброса пароля');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('Письмо для сброса пароля отправлено');
    } catch (e) { showErr(e); }
  };

  const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <section className="auth">
      <div className="box">
        <div className="logo logo-lg">
          <img className="logo-img" src={logoUrl} alt="logo" />
        </div>
        <h1>Загадывай желания</h1>
        <p>Создай свой вишлист или выбери подарок друзьям</p>

        <div className="seg">
          <button type="button" className={`pill ${mode === 'login' ? 'on' : ''}`}
            onClick={() => switchMode('login')}>Вход</button>
          <button type="button" className={`pill ${mode === 'register' ? 'on' : ''}`}
            onClick={() => switchMode('register')}>Регистрация</button>
        </div>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {mode === 'register' && (
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Ваше имя" autoComplete="name" maxLength={40} />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)}
            type="email" placeholder="Email" autoComplete="email" />
          <input value={pass} onChange={e => setPass(e.target.value)}
            type="password" placeholder="Пароль (минимум 6 символов)"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
          <div className={`err ${info ? 'info' : ''}`}>{err || info}</div>
          <button type="submit" className="btn red submit" disabled={busy}>
            {mode === 'register' ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>

        <div className="link-row">
          <button
            type="button"
            className="link"
            onClick={onForgot}
            style={{ visibility: mode === 'login' ? 'visible' : 'hidden' }}
          >
            Забыли пароль?
          </button>
        </div>
      </div>
    </section>
  );
}