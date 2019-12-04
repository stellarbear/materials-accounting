
const authError = (error) => {
  if (error.graphQLErrors[0] && error.graphQLErrors[0].extensions && error.graphQLErrors[0].extensions.code === 'UNAUTHENTICATED') {
    localStorage.removeItem('x-auth');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    return true;
  }
  return false;
}

export default authError;