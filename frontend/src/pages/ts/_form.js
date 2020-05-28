import React from 'react';
import { Button, Form, Checkbox, Segment, Label, Divider, Header, Icon, Table, List, Message, TransitionablePortal } from 'semantic-ui-react';
import DropdownUnits from '../../components/DropdownUnits';
import DropdownTsTypes from '../../components/DropdownTsTypes';
import DropdownTsPurposes from '../../components/DropdownTsPurposes';
import DropdownInfoTypes from '../../components/DropdownInfoTypes';
import DropdownTables from '../../components/DropdownTables';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';
import { omit } from '../../helpers/object';
import { withTranslation } from '../../components/TranslationWrapper';

class TsForm extends React.Component {
  state = {
    id: '',
    number: '',
    unit: '',
    tsType: '',
    tsPurpose: '',
    infoType: '',
    receiptYear: null,
    commissioningYear: null,
    decommissionYear: null,
    table: '',
    tableItem: '',
    isBroken: false,
    isPrivate: false,
    complectation: [],
    responsible: '',
    comment: '',
    loading: false,
    errors: {},
    showPortal: false
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

  componentDidMount = () => {
    const { ts, isNewRecord } = this.props;
    if (!isNewRecord) {
      const complectation = ts.complectation.map((el) => el && el.id);
      this.setState({
        id: ts.id,
        number: ts.number,
        unit: ts.unit.id,
        tsType: ts.tsType.id,
        tsPurpose: ts.tsPurpose.id,
        infoType: ts.infoType.id,
        receiptYear: ts.receiptYear,
        commissioningYear: ts.commissioningYear,
        decommissionYear: ts.decommissionYear,
        table: ts.table.id,
        tableItem: ts.tableItem ? ts.tableItem.id : '',
        isBroken: ts.isBroken,
        isPrivate: ts.isPrivate,
        responsible: ts.responsible,
        comment: ts.comment,
        complectation: complectation,
      });
    }
  }

  addComplectationItem = () => {
    this.setState((prevState) => ({
      complectation: [...prevState.complectation, ''],
    }));
  }

  deleteComplectationItem = (e) => {
    const link = e.target.closest('a');
    const complectation = [...this.state.complectation];
    const id = link.dataset.id;
    complectation.splice(id, 1);
    this.setState({ complectation });
  }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
    if (this.state.errors[name]) {
      this.removeErrorFromField(name);
    }
  }

  complectationChange = (e, { value }) => {
    const input = e.target.closest('div.dropdown').querySelector('input');
    const id = input.dataset.id;
    const complectation = [...this.state.complectation];
    complectation[id] = value;
    this.setState({ complectation });
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

  renderChildren = () => {
    const { complectation } = this.state;
    if (complectation.length) {
      return (
        <React.Fragment>
          <Divider horizontal>
            <Header as='h5'>
              <Icon name='list ol' />
              Комплектация
            </Header>
          </Divider>
          <Table basic='very'>
            <Table.Body>
              {
                complectation.map((item, idx, arr) => {
                  return (
                    <Table.Row key={idx}>
                      <Table.Cell collapsing>{idx + 1}</Table.Cell>
                      <Table.Cell>
                        <Form.Field
                          key={idx}
                          withoutSVT={true}
                          data-id={idx}
                          control={DropdownTsTypes}
                          searchInput={{
                            id: `complectation-${idx}`,
                            name: `complectation-${idx}`,
                            'data-id': idx
                          }}
                          placeholder={this.props.translation.get("Тип ТС")}
                          value={complectation[idx]}
                          onChange={this.complectationChange}
                        />
                      </Table.Cell>
                      <Table.Cell collapsing>
                        <Button
                          color='red'
                          icon as='a'
                          data-id={idx}
                          onClick={this.deleteComplectationItem}
                        >
                          <Icon name='trash alternate' />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  )
                })
              }
            </Table.Body>
          </Table>
        </React.Fragment>
      );
    }
  }

  renderComplectationForm = () => {
    const { tsType, complectation } = this.state;
    if (!tsType) { return null; }
    const type = this.props.client.readFragment({
      id: tsType,
      fragment: gql`
        fragment tsType on TsType {
          id
          name
          withComplectation
        }
      `,
    });
    if (type.withComplectation) {
      return (
        <React.Fragment>
          {
            this.renderChildren()
          }
          <Label
            as='a'
            content={'Добавить комплектацию'}
            basic
            color='blue'
            icon='plus square outline'
            onClick={this.addComplectationItem}
          />
        </React.Fragment>
      );
    }
  }

  validate = async () => {
    const fieldNames = {
      number: this.props.translation.get("Инв. номер"),
      unit: this.props.translation.get("Подразделение"),
      tsType: this.props.translation.get("Тип ТС"),
      tsPurpose: this.props.translation.get("Назначение ТС"),
      infoType: this.props.translation.get("Обрабатываемая информация"),
      receiptYear: this.props.translation.get("Год получения"),
      table: this.props.translation.get("Табель"),
      tableItem: this.props.translation.get("Пункт табеля")
    }
    const requiredFields = [
      'number',
      'unit',
      'tsType',
      'tsPurpose',
      'infoType',
      'receiptYear',
      'table',
    ];
    const errors = {};
    requiredFields.forEach((field) => {
      if (this.state[field].toString() === '') {
        errors[field] = `Поле "${fieldNames[field]}" не может быть пустым!`;
      }
    });
    const complectation = this.state.complectation.filter((item) => {
      return item !== '';
    });
    await this.setState({
      errors,
      showPortal: Boolean(Object.keys(errors).length),
      complectation
    });
    if (Object.keys(errors).length) return false;
    return true;
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    if (this.state.loading || !(await this.validate())) return;
    const { client, mutation, history, isNewRecord } = this.props;
    this.setState({ loading: true });
    try {
      const result = await client.mutate({
        mutation: mutation,
        variables: omit(this.state, ['loading', 'errors', 'showPortal']),
      });
      let id;
      if (isNewRecord) {
        id = result.data.createTS.id;
      } else {
        id = result.data.updateTS.id;
      }
      await client.resetStore();
      history.push(`/ts/${id}`);
    } catch (e) {
      if (e.graphQLErrors && e.graphQLErrors[0] && e.graphQLErrors[0].extensions && e.graphQLErrors[0].extensions.code === 'BAD_USER_INPUT') {
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

  render = () => {
    const { isNewRecord } = this.props;
    const {
      number,
      responsible,
      comment,
      isBroken,
      isPrivate,
      unit,
      tsType,
      infoType,
      table,
      tableItem,
      tsPurpose,
      receiptYear,
      commissioningYear,
      decommissionYear,
      loading,
      showPortal
    } = this.state;
    return (
      <React.Fragment>
        <Form
          onSubmit={this.handleSubmit}
          error={Boolean(Object.keys(this.state.errors).length)}
          autoComplete='off'
        >
          <Segment color='blue'>
            <Form.Group widths='equal'>
              <Form.Input
                required
                error={this.state.errors.number && this.state.errors.number !== ''}
                label={this.props.translation.get("Инв. номер")}
                fluid icon='hashtag'
                iconPosition='left'
                placeholder={this.props.translation.get("Инв. номер")}
                name='number'
                value={number}
                onChange={this.handleChange}
                onBlur={() => { this.setState({ number: number.trim() }) }}
              />
              <Form.Input
                error={this.state.errors.responsible && this.state.errors.responsible !== ''}
                label={this.props.translation.get("Отв. за эксплуатацию")}
                fluid icon='user'
                iconPosition='left'
                placeholder={this.props.translation.get("Отв. за эксплуатацию")}
                name='responsible'
                value={responsible}
                onChange={(event, data) => this.handleChange(event, { name: data.name, value: data.value.replace(/[^А-Яа-я.\s]/g, '') })}
                onBlur={() => { this.setState({ responsible: responsible.trim() }) }}
              />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Field
                error={this.state.errors.unit && this.state.errors.unit !== ''}
                required
                name='unit'
                searchInput={{ id: 'unit' }}
                control={DropdownUnits}
                label={{ children: this.props.translation.get("Подразделение"), htmlFor: 'unit' }}
                placeholder={this.props.translation.get("Подразделение")}
                value={unit}
                onChange={this.handleChange}
              />
              <Form.Field
                required
                name='tsType'
                error={this.state.errors.tsType && this.state.errors.tsType !== ''}
                searchInput={{ id: 'tstype' }}
                control={DropdownTsTypes}
                label={{ children: this.props.translation.get("Тип ТС"), htmlFor: 'tstype' }}
                placeholder={this.props.translation.get("Тип ТС")}
                value={tsType}
                // Custom change for complectation
                onChange={(e, { value }) => {
                  this.setState({ tsType: value, complectation: [] });
                  this.removeErrorFromField('tsType');
                }}
              />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Field
                required
                name='tsPurpose'
                error={this.state.errors.tsPurpose && this.state.errors.tsPurpose !== ''}
                searchInput={{ id: 'tspurpose' }}
                control={DropdownTsPurposes}
                label={{ children: this.props.translation.get("Назначение ТС"), htmlFor: 'tspurpose' }}
                placeholder={this.props.translation.get("Назначение ТС")}
                value={tsPurpose}
                onChange={this.handleChange}
              />
              <Form.Field
                required
                name='infoType'
                error={this.state.errors.infoType && this.state.errors.infoType !== ''}
                searchInput={{ id: 'infotype' }}
                control={DropdownInfoTypes}
                label={{ children: this.props.translation.get("Обрабатываемая информация"), htmlFor: 'infotype' }}
                placeholder={this.props.translation.get("Обрабатываемая информация")}
                value={infoType}
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Input
                required
                error={this.state.errors.receiptYear && this.state.errors.receiptYear !== ''}
                name='receiptYear'
                type='number'
                min="1932"
                label={this.props.translation.get("Год получения")}
                fluid icon='calendar alternate outline'
                iconPosition='left'
                placeholder={this.props.translation.get("Год получения")}
                value={receiptYear || ''}
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Input
              error={this.state.errors.comment && this.state.errors.comment !== ''}
              label='Комментарий'
              fluid icon='terminal'
              iconPosition='left'
              placeholder='Дополнительная информация'
              name='comment'
              value={comment}
              onChange={this.handleChange}
              onBlur={() => { this.setState({ comment: comment.trim() }) }}
            />
            <Form.Group widths='equal'>
              <DropdownTables
                required
                errors={
                  {
                    table: this.state.errors.table && this.state.errors.table !== '',
                  }
                }
                values={{ table: table, tableItem: tableItem }}
                onChange={(table, tableItem) => {
                  this.setState({ table, tableItem });
                  this.removeErrorFromField('table');
                  this.removeErrorFromField('tableItem');
                }}
              />
            </Form.Group>

            {
              this.renderComplectationForm()
            }
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
      </React.Fragment>
    );
  }
}

export default withRouter(withApollo(withTranslation(TsForm)));