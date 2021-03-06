import React, { Component } from 'react';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { withApollo } from 'react-apollo';
import Management from "../components/Management";
import { withTranslation } from '../components/TranslationWrapper';

class Header extends Component {
  state = { activeItem: '' }

  componentDidMount = () => {
    const activeItem = window.location.pathname.split('/')[1];
    this.setState({ activeItem });
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render = () => {
    const { activeItem } = this.state;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const dictionaryFromStorage = localStorage.getItem('dictionaryAccess')
    const dictionaryAccess = (dictionaryFromStorage == "true" ? true : false);
    let currentUsername = '';
    if (currentUser) {
      currentUsername = currentUser.username;
    }

    const version = "1.2.8" // info.version

    return (
      <Menu color='teal' attached className='navbar'>
        <Menu.Item
          header as={Link} to='/'
          name='ts'
          onClick={this.handleItemClick}
        >
          <img alt='logo' src='./logo.png' />
          <span style={{ paddingLeft: 16 }}>
            {version}
          </span>
        </Menu.Item>

        <Menu.Item
          as={Link} to='/'
          name='ts'
          active={activeItem === 'ts' || activeItem === ''}
          onClick={this.handleItemClick}
        >
          <Icon name='desktop' />
          {this.props.translation.get("Технические средства")}

        </Menu.Item>

        <Menu.Item
          as={Link} to='/report'
          name='report'
          active={activeItem === 'report'}
          onClick={this.handleItemClick}
        >
          <Icon name='table' />
          Отчет
        </Menu.Item>

        {["admin"].includes(currentUser.role) &&
          (dictionaryAccess) && (
            <React.Fragment>
              <Dropdown item trigger={<span><Icon name='book' />Справочники</span>}>
                <Dropdown.Menu>
                  <Dropdown.Item
                    as={Link} to='/units'
                    name='units'
                    active={activeItem === 'units'}
                    onClick={this.handleItemClick}
                  >
                    {this.props.translation.get("Подразделение")}
                  </Dropdown.Item>
                  <Dropdown.Item
                    as={Link} to='/types'
                    name='types'
                    active={activeItem === 'types'}
                    onClick={this.handleItemClick}
                  >
                    {this.props.translation.get("Тип ТС")}
                  </Dropdown.Item>
                  <Dropdown.Item
                    as={Link} to='/purposes'
                    name='purposes'
                    active={activeItem === 'purposes'}
                    onClick={this.handleItemClick}
                  >
                    {this.props.translation.get("Назначение ТС")}
                  </Dropdown.Item>
                  <Dropdown.Item
                    as={Link} to='/info_types'
                    name='info_types'
                    active={activeItem === 'info_types'}
                    onClick={this.handleItemClick}
                  >
                    {this.props.translation.get("Обрабатываемая информация")}
                  </Dropdown.Item>
                  <Dropdown.Item
                    as={Link} to='/tables'
                    name='tables'
                    active={activeItem === 'tables'}
                    onClick={this.handleItemClick}
                  >
                    {this.props.translation.get("Табель")}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>


            </React.Fragment>
          )
        }
        {["admin"].includes(currentUser.role) && (
          <Menu.Item
            as={Link} to='/users'
            name='users'
            active={activeItem === 'users'}
            onClick={this.handleItemClick}
          >
            <Icon name='users' />
            Пользователи
          </Menu.Item>
        )}

        <Menu.Menu position='right'>
          {["admin", "moderator"].includes(currentUser.role) && (
            <Management />
          )}

          < Menu.Item
            name='logout'
            active={activeItem === 'logout'}
            onClick={() => {
              localStorage.removeItem('x-auth');
              localStorage.removeItem('user');
              this.props.client.resetStore();
              this.props.history.push(`/`);
            }}
          >
            <Icon name='log out' />
            Выход ({currentUsername})
          </Menu.Item>
        </Menu.Menu>
      </Menu >
    );
  }
}

export default withApollo(withRouter(withTranslation(Header)));