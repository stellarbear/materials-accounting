const isLoggedIn = () => {
  const authToken = localStorage.getItem('x-auth');
  const loginTime = localStorage.getItem('loginTime');
  if (authToken && loginTime > new Date() - 60 * 60 * 24 * 30 * 1000) {
    return true;
  }
  localStorage.removeItem('x-auth');
  localStorage.removeItem('user');
  localStorage.removeItem('loginTime');
  return false;
}

export default isLoggedIn;