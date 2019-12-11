import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Ts from '../../components/Ts';
import { Grid, Segment, Button, Icon, Modal, Pagination, Message, Input } from 'semantic-ui-react';
import Loader from '../../components/Loader';
import Filters from '../../components/Filters';
import Sort from '../../components/Sort';
import { Redirect, Link } from 'react-router-dom';
import authError from '../../helpers/auth_error';

export const ALL_TS_QUERY = gql`
    query allTS($filter: SearchInput, $sort: SortInput, $skip: Int, $limit: Int) {
      allTS(filter: $filter, sort: $sort, skip: $skip, limit: $limit) 
        {
          id
          unit { id name parent { id name } fullPath }
          number
          tsType { id name withComplectation }
          infoType { id name }
          receiptYear
          isBroken
          commissioningYear
          decommissionYear
          tsPurpose { id name }
          table { id name }
          tableItem { id name }
          complectation {
            id
            name
          }
        }
      }
`;

export const DELETE_TS_MUTATION = gql`
  mutation deleteTS($id: String!){
    deleteTS(id: $id) {
      id
      status
    }
  }
`;

class TsList extends Component {

  state = {
    intervalId: null,
    confirmTsNumber: '',
    error: '',
    modal: false,
    id: null,
    name: '',
    activePage: 1,
    count: 0,
    sort: {
      field: 'id',
      sortOrder: 1
    },
    filter: {
      number: '',
      unit: {
        id: null,
        includeChildren: false
      },
      tsTypes: [],
      tsPurposes: [],
      infoTypes: [],
      isBroken: undefined,
      receiptYear: {},
    }
  };

  scrollStep = () => {
    if (window.pageYOffset === 0) {
      clearInterval(this.state.intervalId);
    }
    window.scroll(0, window.pageYOffset - 50);
  }

  scrollToTop = () => {
    let intervalId = setInterval(this.scrollStep, 8.33);
    this.setState({ intervalId: intervalId });
  }

  close = () => this.setState({ modal: false, error: '', confirmTsNumber: '' });

  handlePaginationChange = (e, { activePage }) => {
    this.setState({ activePage });
    this.scrollToTop();
  };

  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
  }

  render = () => {
    document.title = 'Список ТС';
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const { error } = this.state;
    return (
      <React.Fragment>
        <Grid className='ts_page'>
          <Grid.Row className='ts__sort'>
            <Grid.Column width={4}>
              {currentUser.role !== 'user' && (<Button as={Link} to='/ts/create' basic color='teal' style={{ width: "100%" }}>
                <Icon name='plus' />
                Добавить ТС
            </Button>)}
            </Grid.Column>
            <Grid.Column width={4} verticalAlign='middle'>
              <Sort onChange={(sort) => this.setState({ sort, activePage: 1 })} />
            </Grid.Column>
            <Grid.Column textAlign='right' width={4} verticalAlign='middle'>
              {this.state.count > 10 && (
                <Pagination
                  className='custom-pagination'
                  firstItem={null}
                  lastItem={null}
                  siblingRange={1}
                  size='mini'
                  activePage={this.state.activePage}
                  onPageChange={this.handlePaginationChange}
                  totalPages={Math.ceil(this.state.count / 10)}
                />)}
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column width={4}>
              <Segment color='teal'>
                <Filters
                  searchClick={(filter) => this.setState({ filter, activePage: 1 })}
                  countUpdate={(count) => this.setState({ count })}
                />
              </Segment>
            </Grid.Column>
            <Grid.Column width={12} style={{ maxWidth: 800 }} className='ts__container'>
              <Query
                query={ALL_TS_QUERY}
                variables={{
                  filter: this.state.filter,
                  sort: this.state.sort,
                  skip: (this.state.activePage - 1) * 10,
                  limit: 10
                }}
              >
                {({ loading, error, data }) => {
                  if (loading) {
                    return (
                      <Loader />
                    )
                  };
                  if (error) {
                    if (authError(error)) return <Redirect to='/login' />
                    return `Ошибка!: ${error.message}`;
                  }
                  const tsToRender = data.allTS;
                  return (
                    <React.Fragment>
                      {!tsToRender.length && 'Нет записей...'}
                      {tsToRender.map(ts => <Ts key={ts.id} ts={ts} handleDelete={() => {
                        this.setState({
                          modal: true,
                          id: ts.id,
                          name: `${ts.tsType.name}, № ${ts.number}`
                        });
                      }} />)}
                    </React.Fragment>
                  );
                }}
              </Query>

              <Grid.Row>
                <Grid.Column style={{ float: 'right' }} verticalAlign='top'>
                  {this.state.count > 10 && (
                    <Pagination
                      className='custom-pagination'
                      firstItem={null}
                      lastItem={null}
                      siblingRange={1}
                      size='mini'
                      activePage={this.state.activePage}
                      onPageChange={this.handlePaginationChange}
                      totalPages={Math.ceil(this.state.count / 10)}
                    />)}
                </Grid.Column>
              </Grid.Row>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Modal size='tiny' open={this.state.modal} onClose={this.close}>
          <Modal.Header>Удалить ТС</Modal.Header>
          <Modal.Content>
            <p>Вы уверены, что хотите удалить ТС?</p>
            <p><b>{this.state.name}</b></p>
            <React.Fragment>
              <p>
                Для подтверждения введите номер удаляемого ТС
              </p>
              <Input
                error={Boolean(this.state.error)}
                placeholder='Номер ТС'
                value={this.state.confirmTsNumber}
                onChange={(e, { value }) => this.setState({ confirmTsNumber: value, error: '' })}
              />
            </React.Fragment>
            {
              error &&
              <Message
                visible
                error
                header='Ошибка при удалении'
                content={error}
              />
            }
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={this.close}>Отмена</Button>
            <Mutation
              mutation={DELETE_TS_MUTATION}
              variables={{ id: this.state.id }}
            >
              {
                (deleteMutation, { client }) => (
                  <Button color='red' onClick={async () => {
                    try {
                      const numberIndex = this.state.name.indexOf('№ ');
                      const deleteTsNumber = this.state.name.substring(numberIndex + '№ '.length);
                      if (this.state.confirmTsNumber.toLowerCase() !== deleteTsNumber) {
                        this.setState({ error: 'Введенный номер ТС не совпадает с удаляемым!' })
                      } else {
                        await deleteMutation();
                        await client.resetStore();
                        await this.setState({
                          modal: false,
                          id: null,
                          name: '',
                          confirmTsNumber: ''
                        });
                      }
                    } catch (e) {
                      if (authError(e)) {
                        this.props.history.push('/login');
                      }
                      this.setState({ error: e.message })
                    }
                  }
                  }>
                    <Icon name='trash alternate outline' />Удалить
                </Button>
                )
              }
            </Mutation>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default TsList;