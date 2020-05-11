import React from 'react';
import { Form, Input, Button, Segment, Icon, TransitionablePortal, Message, TextArea, Modal } from 'semantic-ui-react';
import { Mutation } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import sortParagraph from '../../helpers/sort_paragraph';
import { withTranslation } from '../../components/TranslationWrapper';

class TableForm extends React.Component {
  state = {
    bulk: "",
    showModal: false,
    id: null,
    name: '',
    tableItems: [{ name: '' }],
    showPortal: false,
    error: ''
  };

  handleChange = (e) => {
    const div = e.target.closest('div');
    const id = div.dataset.id;
    const tableItems = [...this.state.tableItems];
    tableItems[id].name = e.target.value;
    this.setState({ tableItems, error: '', showPortal: false });
  }

  onModalClose = () => {
    this.setState({
      showModal: false,
    })
  }

  onTextAreaChange = (event) => {
    let bulk = event.target.value;
    bulk = bulk.split('\n').map(b => b.replace(/\s/g, ' ').replace(/  /g, ' ')).join('\n')
    this.setState({ bulk })
  }

  onModalSubmit = () => {
    let oldItems = this.state.tableItems.map(o => o.name);
    let newItems = [];
    this.state.bulk.split('\n').forEach(b => {
      let name = b.trim();
      if (!oldItems.includes(name) && name.length > 0) {
        newItems.push({
          name,
        })
      }
    })

    this.setState({
      tableItems: [...this.state.tableItems, ...newItems],
      error: '',
      showPortal: false,
      showModal: false,
    })
  }

  addTableItem = () => {
    this.setState((prevState) => ({
      tableItems: [...prevState.tableItems, { name: '' }],
      error: '',
      showPortal: false
    }));
  }

  deleteTableItem = (e) => {
    const link = e.target.closest('a');
    const tableItems = [...this.state.tableItems];
    const id = link.dataset.id;
    if (tableItems.length > 1) {
      tableItems.splice(id, 1);
      this.setState({ tableItems, error: '', showPortal: false });
    }
  }

  componentDidMount = () => {
    if (!this.props.isNewRecord) {
      const { id, name } = this.props.table;
      let items = this.props.table.items;
      items = items
        .sort((item1, item2) => sortParagraph(item1.name, item2.name))
        .map(el => {
          const { id, name } = el;
          return { id, name };
        });
      this.setState({ id, name, tableItems: items });
    }
  }

  render = () => {
    const { isNewRecord } = this.props;
    let { tableItems, showPortal } = this.state;
    return (
      <React.Fragment>
        <Mutation mutation={this.props.mutation}>
          {(mutation, { client }) => (
            <Form onSubmit={async e => {
              e.preventDefault();
              try {
                await mutation({
                  variables: {
                    id: this.state.id,
                    name: this.state.name,
                    items: this.state.tableItems
                  },
                });
                await client.resetStore();
                this.props.history.push(`/tables`);
              } catch (e) {
                if (e.graphQLErrors && e.graphQLErrors[0] && e.graphQLErrors[0].extensions && e.graphQLErrors[0].extensions.code === 'BAD_USER_INPUT') {
                  const error = e.graphQLErrors[0];
                  const reload = error.extensions.exception.field === 'tableItems' ? true : false;
                  if (reload) {
                    let items = this.props.table.items;
                    items = items.map(el => {
                      const { id, name } = el;
                      return { id, name };
                    });
                    await this.setState({ tableItems: items });
                  }
                  this.setState({
                    showPortal: true,
                    error: error.message
                  });
                } else {
                  this.setState({
                    showPortal: true,
                    error: 'Что-то пошло не так. Пожалуйста, перезагрузите страницу!'
                  });
                }
              }
            }}
              autoComplete='off'
            >
              <Segment color='teal'>
                <Form.Field
                  id='table-name'
                  control={Input}
                  error={Boolean(this.state.error)}
                  label='Название'
                  placeholder={this.props.translation.get("Табель")}
                  required
                  value={this.state.name}
                  onChange={e => this.setState({ name: e.target.value, error: '', showPortal: false })}
                />
                <Segment padded stacked>
                  {
                    tableItems.map((item, idx, arr) => {
                      return (
                        <Form.Field
                          key={idx}
                          data-id={idx}
                          id={`table-item-${idx}`}
                          control={Input}
                          action={
                            arr.length > 1 ? {
                              color: 'red',
                              icon: 'trash alternate',
                              as: 'a',
                              'data-id': idx,
                              onClick: this.deleteTableItem
                            } : null
                          }
                          onChange={this.handleChange}
                          label={this.props.translation.get("Пункт табеля")}
                          placeholder={this.props.translation.get("Пункт табеля")}
                          required
                          value={this.state.tableItems[idx].name}
                        />
                      )
                    })
                  }
                  <div style={{ display: 'flex', justifyContent: "space-between" }}>
                    <Button
                      as='a'
                      size='mini'
                      onClick={this.addTableItem}
                    >
                      <Icon name='add' />
                      Добавить {this.props.translation.get("Пункт табеля")}
                    </Button>
                    <Button
                      as='a'
                      size='mini'
                      onClick={() => {
                        this.setState({ showModal: true });
                        console.log('yo')
                      }}
                    >
                      <Icon name='add' />
                      Добавить списком
                  </Button>
                  </div>
                </Segment>

                <Form.Field
                  id='form-button-control-public'
                  control={Button}
                  content={isNewRecord ? 'Добавить' : 'Сохранить'}
                  color='teal'
                  icon={isNewRecord ? 'add' : 'save'}
                  type='submit'
                />
              </Segment>
            </Form>
          )}
        </Mutation>
        <Modal size='small' open={this.state.showModal} onClose={() => this.onModalClose()}>
          <Modal.Header>Вставьте список записей, разделенных переносом на новую строку</Modal.Header>
          <Modal.Content>
            <Form>
              <TextArea placeholder={`1.1 Пункт\n1.2 Пункт`}
                value={this.state.bulk}
                onChange={this.onTextAreaChange} />
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => this.onModalClose()}>Отмена</Button>
            <Button onClick={() => this.onModalSubmit()} color='teal'>Добавить</Button>
          </Modal.Actions>
        </Modal>
        <TransitionablePortal
          open={showPortal}
          transition={{ animation: 'fly left', duration: 500 }}
        >
          <Message
            negative
            size='small'
            icon='exclamation triangle'
            header=''
            content={this.state.error}
            style={{
              right: '2%',
              position: 'fixed',
              top: '2%',
              zIndex: 1000,
              maxWidth: '30%'
            }}
          />
        </TransitionablePortal>
      </React.Fragment>
    );
  }
}

export default withRouter(withTranslation(TableForm));