import React from 'react';
import { useLogin } from '../hooks/useLogin';

export const LoginPage: React.FC = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    error,
    handleLogin
  } = useLogin();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <form onSubmit={handleLogin} style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2>家計簿ログイン</h2>
        
        {error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}

        <div>
  <label style={{ display: 'block', fontSize: '14px' }}>ユーザー名</label>
  <input
    type="text" // email から text へ
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    required
    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
  />
</div>

        <div>
          <label style={{ display: 'block', fontSize: '14px' }}>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px',
            backgroundColor: isLoading ? '#ccc' : '#3ecf8e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </div>
  );
};