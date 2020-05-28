import React from 'react';
import { Button, Form, Grid, Header, Image, Segment, Message } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import '../styles/Login.css';
import isLoggedIn from '../helpers/is_logged_in';
import { Redirect } from 'react-router-dom';

const LOGIN_MUTATION = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        username
        role
        unit { id, name, fullPath }
      }
    }
  }`;

class LoginForm extends React.Component {
  state = {
    username: '',
    password: '',
    error: ''
  };

  render = () => {
    document.title = 'Вход - Феникс';
    const { username, password } = this.state;
    if (isLoggedIn()) {
      return <Redirect to='/' />;
    }
    return (
      <div className='login-form'>
        <Grid textAlign='center' verticalAlign='middle'>
          <Grid.Column>
            <Header as='h2' color='blue' textAlign='center'>
              <Image src='./logo.png' />
            </Header>
            <Form size='large'>
              <Segment>
                <Header>Добро пожаловать!</Header>
                <Form.Input
                  error={Boolean(this.state.error)}
                  fluid icon='user'
                  iconPosition='left'
                  placeholder='Имя пользователя'
                  value={username}
                  onChange={e => this.setState({ username: e.target.value, error: '' })}
                />
                <Form.Input
                  error={Boolean(this.state.error)}
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Пароль'
                  type='password'
                  value={password}
                  onChange={e => this.setState({ password: e.target.value, error: '' })}
                />

                <Mutation
                  mutation={LOGIN_MUTATION}
                  variables={{ username, password }}
                  onCompleted={data => this._confirm(data)}
                  onError={error => {
                    this.setState({ error: 'Неверное имя пользователя или пароль!' })
                  }
                  }
                >
                  {mutation => (
                    <React.Fragment>
                      <Button color='blue' fluid size='large' onClick={() => {
                        if (username && password) {
                          mutation();
                        } else {
                          this.setState({ error: 'Имя пользователя или пароль не могут быть пустыми!' });
                        }
                      }
                      }>
                        Вход
                      </Button>
                      {
                        this.state.error ?
                          <Message
                            visible
                            error
                            header='Ошибка авторизации'
                            content={this.state.error}
                          /> : null
                      }
                    </React.Fragment>
                  )}
                </Mutation>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    );
  }

  _confirm = async data => {
    const userData = data.login;
    this._saveUserData(userData);
    this.props.history.push(`/`);
  }

  _saveUserData = ({ token, user }) => {
    localStorage.setItem('x-auth', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('loginTime', new Date().getTime());
  }
}

export default LoginForm;