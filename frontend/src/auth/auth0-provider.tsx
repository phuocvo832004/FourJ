import React, { PropsWithChildren, useEffect } from 'react';
import { Auth0Provider, AppState } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { auth0Config } from './auth0-config';

export const Auth0ProviderWithNavigate: React.FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();

  // Xóa cookies cũ có thể gây xung đột
  useEffect(() => {
    // Xóa cache cũ để đảm bảo đăng nhập mới
    localStorage.removeItem('auth0.is.authenticated');
    
    // Xóa cookies liên quan đến Auth0
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }, []);

  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: auth0Config.scope,
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
}; 