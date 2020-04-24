import React from 'react';
import { Form, Header, Icon, Button, Checkbox, Divider, Loader, Label, Grid } from 'semantic-ui-react';
import DropdownTsTypes from './DropdownTsTypes';
import DropdownTsPurposes from './DropdownTsPurposes';
import DropdownInfoTypes from './DropdownInfoTypes';
import DropdownUnits from './DropdownUnits';
import Range from './Range';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import { omit } from '../helpers/object';
import DropdownTables from './DropdownTables';
import { withTranslation } from '../components/TranslationWrapper';

const timerDuration = 256;

export const TS_COUNT_QUERY = gql`
    query tsCount($filter: SearchInput) {
      tsCount(filter: $filter) 
    }
`;

export const TS_YEARS_RANGE_QUERY = gql`
    query tsYearsRange($filter: SearchInput) {
      tsYearsRange(filter: $filter) 
        {
          receiptYearMin
          receiptYearMax
          commissioningYearMin
          commissioningYearMax
          decommissionYearMin
          decommissionYearMax
        }
      }
`;

const defaultState = {
  number: '',
  tsTypes: [],
  tsPurposes: [],
  infoTypes: [],
  unit: {
    id: null,
    includeChildren: false
  },
  isBroken: undefined,
  table: '',
  responsible: '',
  tableItem: '',
  receiptYear: {},
  commissioningYear: {},
  decommissionYear: {},
  optionalFields: {
    showCommissioningYear: false,
    showDecommissionYear: false
  },
  timerId: undefined
};

class Filters extends React.Component {
  state = {
    ...defaultState,
    autoSearch: false,
    stats: {},
  };

  fetchCount = async (state = this.state) => {
    const { client } = this.props;
    try {
      const { data } = await client.query({
        query: TS_COUNT_QUERY,
        variables: { filter: omit(state, ['stats', 'optionalFields', 'timerId', 'autoSearch']) }
      });
      const count = data.tsCount;
      await this.setState(prevState => {
        const { stats } = prevState;
        stats.count = count;
        return {
          stats
        }
      });
      this.props.countUpdate(count);
    } catch (e) {
    }
  }

  fetchYears = async () => {
    const { client } = this.props;
    try {
      const { data } = await client.query({
        query: TS_YEARS_RANGE_QUERY,
        variables: { filter: omit(this.state, ['stats', 'optionalFields', 'timerId', 'autoSearch']) }
      });
      const yearsRange = data.tsYearsRange;
      await this.setState(prevState => {
        const stats = { count: prevState.stats.count, ...yearsRange };
        return {
          stats
        }
      });
    } catch (e) {
    }
  }

  componentDidMount = () => {
    const filters = localStorage.getItem("filters");

    if (filters) {
      const newState = { ...defaultState, ...JSON.parse(filters) };
      if (this.props.isReport) {
        newState.number = '';
        newState.tsTypes = [];
      }
      this.setState(newState)
      if (!this.props.isReport) {
        this.fetchCount(newState);
      }
      this.props.searchClick({ ...omit(newState, ['stats', 'optionalFields', 'timerId', 'autoSearch']) })
    } else {
      if (!this.props.isReport) {
        this.fetchCount();
      }
    }

    this.fetchYears();
  }

  updateState = (newState) => {
    clearInterval(this.state.timerId)
    this.setState({ ...newState });

    localStorage.setItem("filters", JSON.stringify({ ...this.state, ...newState }))

    if (this.state.autoSearch) {
      const timerId = setTimeout(() => {
        this.fetchCount();
        this.props.searchClick({ ...omit(this.state, ['stats', 'optionalFields', 'timerId', 'autoSearch']) })
      }, timerDuration)

      this.setState({ timerId });
    }
  }

  componentWillUnmount = () => {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  render = () => {
    return (
      <React.Fragment>
        <Header as='h3' dividing>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}>
            <Icon name='filter' size="small" />
            <span>Фильтры</span>
            <Icon color="teal" name='close' style={{ cursor: "pointer" }} onClick={() => this.updateState(defaultState)} size="small" />
          </div>
        </Header>
        <Form>
          <Form.Field>
            <Checkbox
              label='Автоматический поиск'
              checked={this.state.autoSearch}
              onChange={() => this.updateState({ autoSearch: !this.state.autoSearch })}
            />
          </Form.Field>
          {!this.props.isReport && (<Form.Input
            label={this.props.translation.get("Инв. номер")}
            fluid icon='hashtag'
            iconPosition='left'
            placeholder={this.props.translation.get("Инв. номер")}
            value={this.state.number}
            onChange={(e, { name, value }) => this.updateState({ number: value, })}
          />)}
          <Form.Field
            name='unit'
            searchInput={{ id: 'unit' }}
            control={DropdownUnits}
            label={{ children: this.props.translation.get("Подразделение"), htmlFor: 'unit' }}
            placeholder={this.props.translation.get("Подразделение")}
            value={this.state.unit.id}
            onChange={(e, { value }) => {
              const unit = { ...this.state.unit };
              unit.id = value;
              this.updateState({ unit })
            }}
          />
          {Boolean(this.state.unit.id) && (
            <Form.Field>
              <Checkbox
                label='Искать во вложенных записях'
                checked={this.state.unit.includeChildren}
                onChange={() => {
                  const unit = { ...this.state.unit };
                  unit.includeChildren = !unit.includeChildren;
                  this.updateState({ unit })
                }}
              />
            </Form.Field>
          )}
          <Form.Input
            label={this.props.translation.get("Отв. за эксплуатацию")}
            fluid icon='user'
            iconPosition='left'
            placeholder={this.props.translation.get("Отв. за эксплуатацию")}
            value={this.state.responsible}
            onChange={(e, { name, value }) => this.updateState({ responsible: value, })}
          />
          {!this.props.isReport && (<Form.Field
            name='tsType'
            label={{
              children: this.props.translation.get("Тип ТС"), htmlFor: 'tstype'
            }}
            searchInput={{ id: 'tstype' }}
            control={DropdownTsTypes}
            placeholder={this.props.translation.get("Тип ТС")}
            multiple={true}
            value={this.state.tsTypes}
            onChange={(e, { value }) => this.updateState({ tsTypes: value })}
          />)}
          <Form.Field
            name='tsPurpose'
            searchInput={{ id: 'tspurpose' }}
            control={DropdownTsPurposes}
            label={{ children: this.props.translation.get("Назначение ТС"), htmlFor: 'tspurpose' }}
            placeholder={this.props.translation.get("Назначение ТС")}
            multiple={true}
            value={this.state.tsPurposes}
            onChange={(e, { value }) => this.updateState({ tsPurposes: value })}
          />
          <Form.Field
            name='infoType'
            searchInput={{ id: 'infotype' }}
            control={DropdownInfoTypes}
            label={{ children: this.props.translation.get("Обрабатываемая информация"), htmlFor: 'infotype' }}
            placeholder={this.props.translation.get("Обрабатываемая информация")}
            multiple={true}
            value={this.state.infoTypes}
            onChange={(e, { value }) => this.updateState({ infoTypes: value })}
          />
          <Form.Field className='radio-group'>
            <label>Тип записи:</label>
          </Form.Field>
          <Form.Field className='radio-group'>
            <Checkbox
              radio
              label='Любое'
              name='checkboxRadioGroup'
              value={undefined}
              checked={this.state.isPrivate === undefined}
              onChange={(e, { value }) => this.updateState({ isPrivate: value })}
            />
          </Form.Field>
          <Form.Field className='radio-group'>
            <Checkbox
              radio
              label='Публичный (экспортируемый)'
              name='checkboxRadioGroup'
              value={"false"}
              checked={this.state.isPrivate === false}
              onChange={(e, { value }) => value === "false" && this.updateState({ isPrivate: false })}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label='Для внутреннего использования'
              name='checkboxRadioGroup'
              value={"true"}
              checked={this.state.isPrivate === true}
              onChange={(e, { value }) => value === "true" && this.updateState({ isPrivate: true })}
            />
          </Form.Field>
          <Form.Field className='radio-group'>
            <label>Состояние:</label>
          </Form.Field>
          <Form.Field className='radio-group'>
            <Checkbox
              radio
              label='Любое'
              name='checkboxRadioGroup'
              value={undefined}
              checked={this.state.isBroken === undefined}
              onChange={(e, { value }) => this.updateState({ isBroken: value })}
            />
          </Form.Field>
          <Form.Field className='radio-group'>
            <Checkbox
              radio
              label='Исправно'
              name='checkboxRadioGroup'
              value={"false"}
              checked={this.state.isBroken === false}
              onChange={(e, { value }) => value === "false" && this.updateState({ isBroken: false })}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label='Неисправно'
              name='checkboxRadioGroup'
              value={"true"}
              checked={this.state.isBroken === true}
              onChange={(e, { value }) => value === "true" && this.updateState({ isBroken: true })}
            />
          </Form.Field>
          <Form.Field>
            <label> {this.props.translation.get("Год получения")}:
              {
                Boolean(this.state.stats.receiptYearMin && this.state.stats.receiptYearMax) ? (
                  <Range
                    min={this.state.stats.receiptYearMin}
                    max={this.state.stats.receiptYearMax}
                    onChange={(e) => {
                      const [min, max] = e;
                      this.updateState({
                        receiptYear: {
                          start: min,
                          end: max
                        }
                      });
                    }}
                  />
                ) : (
                    <Loader active inline size='mini' />
                  )
              }
            </label>
          </Form.Field>
          <Form.Field>
            <Checkbox
              label={`Фильтр ${this.props.translation.get("Год ввода в эксплуатацию")}`}
              checked={this.state.optionalFields.showCommissioningYear}
              onChange={() => {
                const optionalFields = { ...this.state.optionalFields };
                optionalFields.showCommissioningYear = !optionalFields.showCommissioningYear;
                const comYear = {};
                if (optionalFields.showCommissioningYear) {
                  comYear.start = this.state.stats.commissioningYearMin || 1932;
                  comYear.end = this.state.stats.commissioningYearMax || new Date().getFullYear();
                }
                this.updateState({
                  optionalFields,
                  commissioningYear: comYear
                });
              }}
            />
          </Form.Field>
          {
            this.state.optionalFields.showCommissioningYear && (
              <Form.Field>
                <label> {this.props.translation.get("Год ввода в эксплуатацию")}:
                  {
                    Boolean(this.state.stats.commissioningYearMin && this.state.stats.commissioningYearMax) ? (
                      <Range
                        min={this.state.stats.commissioningYearMin}
                        max={this.state.stats.commissioningYearMax}
                        onChange={(e) => {
                          const [min, max] = e;
                          this.updateState({
                            commissioningYear: {
                              start: min,
                              end: max
                            }
                          });
                        }}
                      />
                    ) : (
                        <Loader active inline size='mini' />
                      )
                  }
                </label>
              </Form.Field>
            )
          }
          <Form.Field>
            <Checkbox
              label={`Фильтр ${this.props.translation.get("Год вывода из эксплуатации")}`}
              checked={this.state.optionalFields.showDecommissionYear}
              onChange={() => {
                const optionalFields = { ...this.state.optionalFields };
                optionalFields.showDecommissionYear = !optionalFields.showDecommissionYear;
                const decomYear = {};
                if (optionalFields.showDecommissionYear) {
                  decomYear.start = this.state.stats.decommissionYearMin || 1932;
                  decomYear.end = this.state.stats.decommissionYearMax || new Date().getFullYear();
                }
                this.updateState({
                  optionalFields,
                  decommissionYear: decomYear
                });
              }}
            />
          </Form.Field>
          {
            this.state.optionalFields.showDecommissionYear && (
              <Form.Field>
                <label> {this.props.translation.get("Год вывода из эксплуатации")}:
                  {
                    Boolean(this.state.stats.decommissionYearMin && this.state.stats.decommissionYearMax) ? (
                      <Range
                        min={this.state.stats.decommissionYearMin}
                        max={this.state.stats.decommissionYearMax}
                        onChange={(e) => {
                          const [min, max] = e;
                          this.updateState({
                            decommissionYear: {
                              start: min,
                              end: max
                            }
                          });
                        }}
                      />
                    ) : (
                        <Loader active inline size='mini' />
                      )
                  }
                </label>
              </Form.Field>
            )
          }

          <DropdownTables
            values={{ table: this.state.table, tableItem: this.state.tableItem }}
            onChange={(table, tableItem) => {
              this.updateState({ table, tableItem });
            }}
            filters={true}
          />
          <Divider />
          <Grid verticalAlign='middle'>
            <Grid.Column width={8}>
              <Button
                size='small'
                basic
                color='teal'
                onClick={() => {
                  this.fetchCount();
                  this.props.searchClick({ ...omit(this.state, ['stats', 'optionalFields', 'timerId', 'autoSearch']) })
                }}>
                <Icon name='search' />
                Применить
          </Button>
            </Grid.Column>
            <Grid.Column width={8} textAlign='right'>
              {!this.props.isReport && (<Label>
                Найдено:
                <Label.Detail>{this.state.stats.count}</Label.Detail>
              </Label>)}
            </Grid.Column>
          </Grid>
          <Divider fitted clearing hidden />
        </Form>
      </React.Fragment >
    )
  }
}

export default withApollo(withTranslation(Filters));