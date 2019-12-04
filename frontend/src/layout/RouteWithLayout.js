import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Header from './Header';
import { Container } from 'semantic-ui-react';
import isLoggedIn from '../helpers/is_logged_in';

const RouteWithLayout = ({ component: Component, auth, roles, ...rest }) => {
  if (auth && !isLoggedIn()) {
    return <Redirect to='/login' />
  }
  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (roles && roles.length && !roles.includes(currentUser.role)) {
    return <Redirect to='/404' />
  }

  return (
    <Route {...rest} render={props => (
      <React.Fragment>
        <Header />
        <Container>
          <Component {...props} />
        </Container>
      </React.Fragment>
    )} />
  )
}

export default RouteWithLayout;