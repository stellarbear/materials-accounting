import React from 'react';
import { Form, Input, Button, Segment, TransitionablePortal, Message } from 'semantic-ui-react';
import DropdownUnits from '../../components/DropdownUnits';
import { Mutation } from 'react-apollo';
import { withRouter } from 'react-router-dom';

class UnitForm extends React.Component {
  state = {
    name: '',
    parent: '',
    error: '',
    showPortal: false
  };

  componentDidMount = () => {
    if (!this.props.isNewRecord) {
      const { name, parent } = this.props;
      this.setState({ name, parent: parent ? parent.id: "" });
    }
  }

  render = () => {
    const { isNewRecord } = this.props;
    const { showPortal, error } = this.state;
    return (
      <React.Fragment>
        <Mutation mutation={this.props.mutation}>
          {(mutation, { client }) => (
            <Form onSubmit={async e => {
              e.preventDefault();
              try {
                await mutation({
                  variables: {
                    id: this.props.ommit,
                    name: this.state.name,
                    parent: this.state.parent || null
                  },
                });
                await client.resetStore();
                this.props.history.push(`/units`);
              } catch (e) {
                if (e.graphQLErrors && e.graphQLErrors[0] && e.graphQLErrors[0].extensions && e.graphQLErrors[0].extensions.code === 'BAD_USER_INPUT') {
                  const error = e.graphQLErrors[0];
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
                <Form.Group widths='equal'>
                  <Form.Field
                    id='form-input-control-first-name'
                    control={Input}
                    error={Boolean(error)}
                    label='Название'
                    placeholder='Название'
                    required
                    value={this.state.name}
                    onChange={e => this.setState({ name: e.target.value, showPortal: false, error: '' })}
                  />
                  <Form.Field
                    searchInput={{ id: 'form-select-control-parent' }}
                    control={DropdownUnits}
                    label={{ children: 'Родитель', htmlFor: 'form-select-control-parent' }}
                    placeholder='Родитель'
                    value={this.state.parent}
                    onChange={(e, { value }) => this.setState({ parent: value, showPortal: false, error: '' })}
                    ommit={this.props.ommit}
                  />
                </Form.Group>
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
        <TransitionablePortal
          open={showPortal}
          transition={{ animation: 'fly left', duration: 500 }}
        >
          <Message
            negative
            size='small'
            icon='exclamation triangle'
            header=''
            content={error}
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

export default withRouter(UnitForm);