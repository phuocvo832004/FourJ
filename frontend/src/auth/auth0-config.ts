// Thông tin từ Auth0 dashboard
export const auth0Config = {
  domain: "dev-vihsigx84vhnlzvg.us.auth0.com",
  clientId: "Jeja5neKhzTZiMSLNyDd1wGCKSvWIeGa",
  redirectUri: window.location.origin,
  audience: "http://localhost:80",
  scope: "openid profile email roles offline_access",
  rolesNamespace: "https://myapp.example.com/roles"
}; 