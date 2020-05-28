import React from 'react';
import { Form, Segment, Button, Dropdown, Header, TransitionablePortal, Message, List } from 'semantic-ui-react';
import DropdownUnits from '../../components/DropdownUnits';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { omit } from '../../helpers/object';
import { withTranslation } from '../../components/TranslationWrapper';

const options = [
  {
    key: 1,
    text: 'Пользователь',
    value: 'user',
    content: <Header icon='user outline' content='Пользователь' subheader='Доступ на чтение' />,
  },
  {
    key: 2,
    text: 'Модератор',
    value: 'moderator',
    content: <Header icon='edit outline' content='Модератор' subheader='Доступ на чтение и редактирование' />,
  },
  {
    key: 3,
    text: 'Администратор',
    value: 'admin',
    content: <Header icon='star outline' content='Администратор' subheader='Полный доступ + управление пользователями' />,
  },
];

class UserForm extends React.Component {

  state = {
    id: '',
    showPassword: false,
    username: '',
    password: '',
    role: 'user',
    unit: null,
    loading: false,
    errors: {},
    showPortal: false,
    updatePassword: false
  };

  componentDidMount = () => {
    const { user, isNewRecord } = this.props;
    if (!isNewRecord) {
      this.setState({
        id: user.id,
        username: user.username,
        unit: (user.unit && user.unit.id) || null,
        role: user.role,
      });
    }
  }

  renderErrors = () => {
    const errors = { ...this.state.errors };
    const keys = Object.keys(errors);
    return (
      <List as='ul'>
        {
          keys.map((key, idx) => {
            return (
              <List.Item key={idx} as='li'>{errors[key]}</List.Item>
            );
          })
        }
      </List>
    );
  }

  removeErrorFromField = (fieldName) => {
    this.setState((prevState) => {
      const errors = { ...prevState.errors };
      delete errors[fieldName];
      return {
        errors,
        showPortal: false
      }
    });
  }

  validate = async () => {
    const fieldNames = {
      username: 'Имя пользователя',
      password: 'Пароль',
      unit: this.props.translation.get("Подразделение"),
      role: 'Роль',
    }
    const requiredFields = [
      'username',
      'password',
      'role'
    ];
    const errors = {};
    requiredFields.forEach((field) => {
      if (this.state[field].toString().trim() === '') {
        errors[field] = `Поле "${fieldNames[field]}" не может быть пустым!`;
      }
    });
    if (this.state.password.length < 6) {
      errors.password = 'Длина пароля должна быть не менее 6 символов!'
    }
    if (!this.state.updatePassword && !this.props.isNewRecord) {
      delete errors.password;
    }
    if (this.state.unit === '') {
      await this.setState({ unit: null });
    }
    await this.setState({
      errors,
      showPortal: Boolean(Object.keys(errors).length),
    });
    if (Object.keys(errors).length) return false;
    return true;
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    if (this.state.loading || !(await this.validate())) return;
    const { client, mutation, history } = this.props;
    this.setState({ loading: true });
    try {
      await client.mutate({
        mutation: mutation,
        variables: omit(this.state, ['loading', 'errors', 'showPortal', 'showPassword', 'updatePassword']),
      });
      await client.resetStore();
      history.push(`/users`);
    } catch (e) {
      if (e.graphQLErrors && e.graphQLErrors[0].extensions && e.graphQLErrors[0].extensions.code === 'BAD_USER_INPUT') {
        const error = e.graphQLErrors[0];
        this.setState((prevState) => {
          const errors = { ...prevState.errors };
          const field = error.extensions.exception.field;
          errors[field] = error.message;
          return {
            errors,
            loading: false,
            showPortal: true,
          }
        });
      } else {
        this.setState((prevState) => {
          const errors = { ...prevState.errors };
          errors.network = 'Что-то пошло не так. Пожалуйста, перезагрузите страницу!'
          return {
            errors,
            showPortal: true
          }
        });
      }
    }
  }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
    this.removeErrorFromField(name);
  }

  renderPasswordField = () => {
    const { password, showPassword, updatePassword } = this.state;
    const { isNewRecord } = this.props;
    if (updatePassword) {
      return (
        <Form.Group>
          <Form.Input
            label='Новый пароль'
            name='password'
            type={showPassword ? 'text' : 'password'}
            icon={{
              name: showPassword ? 'eye slash' : 'eye',
              circular: true,
              link: true,
              onClick: () => this.setState((prevState) => { return { showPassword: !prevState.showPassword } })
            }}
            value={password}
            onChange={this.handleChange}
            error={this.state.errors.password && this.state.errors.password !== ''}
            width={15}
          />
          <Form.Field style={{ position: 'relative' }} width={1}>
            <Button
              as='a'
              color='blue'
              icon='cancel'
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0
              }}
              onClick={() => this.setState({ updatePassword: false, password: '' })}
            />
          </Form.Field>
        </Form.Group>
      );
    }
    if (isNewRecord) {
      return (
        <Form.Input
          label='Пароль'
          name='password'
          type={showPassword ? 'text' : 'password'}
          icon={{
            name: showPassword ? 'eye slash' : 'eye',
            circular: true,
            link: true,
            onClick: () => this.setState((prevState) => { return { showPassword: !prevState.showPassword } })
          }}
          value={password}
          onChange={this.handleChange}
          error={this.state.errors.password && this.state.errors.password !== ''}
        />
      );
    }
    return (
      <Form.Group>
        <Form.Input
          label='Пароль'
          type='password'
          value='1234567890'
          disabled
          width={15}
        />
        <Form.Field style={{ position: 'relative' }} width={1}>
          <Button
            as='a'
            color='blue'
            icon='pencil'
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0
            }}
            onClick={() => this.setState({ updatePassword: true })}
          />
        </Form.Field>
      </Form.Group>
    );
  }

  render = () => {
    const { isNewRecord } = this.props;
    const { username, role, loading, unit, showPortal } = this.state;
    return (
      <React.Fragment>
        <Form
          autoComplete='off'
          onSubmit={this.handleSubmit}
          error={Boolean(Object.keys(this.state.errors).length)}
        >
          <Segment color='blue'>
            <Form.Input
              label='Имя пользователя'
              name='username'
              value={username}
              onChange={this.handleChange}
              error={this.state.errors.username && this.state.errors.username !== ''}
            />
            {this.renderPasswordField()}
            <Form.Field
              name='unit'
              searchInput={{ id: 'unit' }}
              control={DropdownUnits}
              label={{ children: this.props.translation.get("Подразделение"), htmlFor: 'unit' }}
              value={unit}
              onChange={this.handleChange}
              error={this.state.errors.unit && this.state.errors.unit !== ''}
            />
            <Form.Field
              label='Роль'
              name='role'
              control={Dropdown}
              options={options}
              selection
              value={role}
              onChange={this.handleChange}
              error={this.state.errors.role && this.state.errors.role !== ''}
            >
            </Form.Field>
          </Segment>
          <Form.Field
            id='submit-button'
            loading={loading}
            control={Button}
            content={isNewRecord ? 'Добавить' : 'Сохранить'}
            color='blue'
            icon={isNewRecord ? 'add' : 'save'}
            type='submit'
          />
        </Form>

        <TransitionablePortal
          open={showPortal}
          transition={{ animation: 'fly left', duration: 500 }}
        >
          <Message
            negative
            size='small'
            icon='exclamation triangle'
            header=''
            content={this.renderErrors()}
            style={{
              right: '2%',
              position: 'fixed',
              top: '2%',
              zIndex: 1000,
              maxWidth: '30%'
            }}
          />
        </TransitionablePortal>
      </React.Fragment >
    );
  }
}

export default withRouter(withApollo(withTranslation(UserForm)));