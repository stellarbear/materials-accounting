import React from 'react';
import { Header, Table, Button } from 'semantic-ui-react';
import { ALL_TS_QUERY } from '../ts/ts_index';
import { Query } from 'react-apollo';
import authError from '../../helpers/auth_error';
import Loader from '../../components/Loader';
import { Redirect } from 'react-router-dom';
import { withTranslation } from '../../components/TranslationWrapper';

class TsReport extends React.Component {

  state = {
    includeComplectation: false,
  };

  convertAllTsToReport = (allTs) => {
    const reportData = {};
    allTs.forEach((ts) => {
      if (reportData[ts.tsType.id]) {
        reportData[ts.tsType.id].count += 1;
      } else {
        reportData[ts.tsType.id] = {};
        reportData[ts.tsType.id].count = 1;
        reportData[ts.tsType.id].name = ts.tsType.name;
      }

      if (this.state.includeComplectation) {
        ts.complectation.forEach(tsCom => {
          if (reportData[tsCom.id]) {
            reportData[tsCom.id].count += 1;
          } else {
            reportData[tsCom.id] = {};
            reportData[tsCom.id].count = 1;
            reportData[tsCom.id].name = tsCom.name;
          }
        });
      }
    });
    return reportData;
  };

  generateCSV = (data) => {
    let csv = `data:text/csv;charset=utf-8,\ufeff${this.props.translation.get("Тип ТС")};Количество\n`;
    let total = 0;
    for (const tstsType in data) {
      csv += `${data[tstsType].name};${data[tstsType].count}\n`;
      total += data[tstsType].count;
    }
    csv += `Итого:;${total}\n`;
    return encodeURI(csv);
  };

  renderTable = (reportData) => {
    const result = [];
    let total = 0;
    for (const id in reportData) {
      total += reportData[id].count;
      result.push(
        <Table.Row key={id}>
          <Table.Cell collapsing>{reportData[id].name}</Table.Cell>
          <Table.Cell collapsing />
          <Table.Cell collapsing textAlign='center'>{reportData[id].count}</Table.Cell>
        </Table.Row>
      );
    }
    result.push(
      <Table.Row key='total' active>
        <Table.Cell collapsing><b>Итого:</b></Table.Cell>
        <Table.Cell collapsing />
        <Table.Cell collapsing textAlign='center'><b>{total}</b></Table.Cell>
      </Table.Row>
    );
    return result;
  };

  render = () => {
    document.title = 'Отчет по типам ТС';
    const { includeComplectation } = this.state;
    return (
      <Query
        query={ALL_TS_QUERY}
        variables={{
          filter: this.props.filter,
        }}
      >
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <Loader />
            )
          }
          if (error) {
            if (authError(error)) return <Redirect to='/login' />
            return `Ошибка!: ${error.message}`;
          }
          const allTs = data.allTS;
          const dataToRender = this.convertAllTsToReport(allTs);
          return (
            <Table striped padded>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>
                    <Header as='h2' floated='left' style={{ marginBottom: 0 }} color='teal'>Отчет по ТС</Header>
                  </Table.HeaderCell>
                  <Table.HeaderCell textAlign='right'>
                    <Button basic toggle active={includeComplectation} size='tiny' onClick={
                      () => {
                        this.setState((prevState) => {
                          return {
                            includeComplectation: !prevState.includeComplectation
                          }
                        })
                      }
                    }>
                      {
                        includeComplectation ? 'С комплектацией' : 'Без комплектации'
                      }
                    </Button>
                  </Table.HeaderCell>
                  <Table.HeaderCell textAlign='center'>
                    <Button
                      basic
                      color='teal'
                      icon='save'
                      content='Экспорт'
                      size='tiny'
                      as='a'
                      href={this.generateCSV(dataToRender)}
                      download='report'
                    />
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  this.renderTable(dataToRender)
                }
              </Table.Body>
            </Table>
          );
        }}
      </Query>
    );
  }
}

export default withTranslation(TsReport);