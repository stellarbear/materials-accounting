import React from 'react';
import { Header, Table, Button } from 'semantic-ui-react';
import { ALL_TS_QUERY } from '../ts/ts_index';
import { Query } from 'react-apollo';
import authError from '../../helpers/auth_error';
import Loader from '../../components/Loader';
import { Redirect } from 'react-router-dom';
import StringLimit from '../../components/StringLimit';
import sortParagraph from '../../helpers/sort_paragraph';
import { withTranslation } from '../../components/TranslationWrapper';

class TablesReport extends React.Component {

  convertAllTsToReport = (allTs) => {
    const reportData = {};
    allTs.forEach((ts) => {
      const id = ts.table.id;
      const itemID = ts.tableItem.id
      // add table info
      if (reportData[id]) {
        reportData[id].tableCount += 1;
      } else {
        reportData[id] = {};
        reportData[id].tableItems = {};
        reportData[id].tableName = ts.table.name;
        reportData[id].tableCount = 1;
      }
      // add tableItem info
      if (reportData[id].tableItems[itemID]) {
        reportData[id].tableItems[itemID].count += 1;
      } else {
        reportData[id].tableItems[itemID] = {};
        reportData[id].tableItems[itemID].name = ts.tableItem.name;
        reportData[id].tableItems[itemID].count = 1;
      }
    });
    return reportData;
  };

  generateCSV = (data) => {
    let csv = `data:text/csv;charset=utf-8,\ufeff${this.props.translation.get("Тип ТС")};Количество\n`;
    let total = 0;
    for (const d in data) {
      const table = data[d];
      csv += `${table.tableName};\n`;
      total += table.tableCount;
      // eslint-disable-next-line no-loop-func
      Object.keys(table.tableItems)
        .sort((itemID1, itemID2) => sortParagraph(table.tableItems[itemID1].name, table.tableItems[itemID2].name))// eslint-disable-next-line
        .forEach((itemID) => {
          csv += `${table.tableItems[itemID].name};${table.tableItems[itemID].count}\n`;
        });
      csv += `Итого:;${table.tableCount}\n\n`;
    }
    csv += `Общий итог:;${total}\n`;
    return encodeURI(csv);
  };

  renderTable = (reportData) => {
    const result = [];
    let total = 0;
    for (const id in reportData) {
      const table = reportData[id];
      total += table.tableCount;
      result.push(
        <React.Fragment key={id}>
          <Table.Row active>
            <Table.HeaderCell textAlign='center' colSpan='2'>{table.tableName}</Table.HeaderCell>
          </Table.Row>
          {
            Object.keys(table.tableItems)
              .sort((itemID1, itemID2) => sortParagraph(table.tableItems[itemID1].name, table.tableItems[itemID2].name))
              .map(itemID => {
                return (
                  <Table.Row key={itemID}>
                    <Table.Cell>
                      <StringLimit component={Table.Cell} text={table.tableItems[itemID].name} limit={100} />
                    </Table.Cell>
                    <Table.Cell textAlign='center'>
                      {table.tableItems[itemID].count}
                    </Table.Cell>
                  </Table.Row>
                );
              })
          }
          <Table.Row>
            <Table.Cell>
              <b>Итого:</b>
            </Table.Cell>
            <Table.Cell collapsing textAlign='center'>{table.tableCount}</Table.Cell>
          </Table.Row>
        </React.Fragment>
      );
    }
    result.push(
      <Table.Row key='total' active>
        <Table.Cell collapsing><b>Общий итог:</b></Table.Cell>
        <Table.Cell collapsing textAlign='center'><b>{total}</b></Table.Cell>
      </Table.Row>
    );
    return result;
  };

  render = () => {
    document.title = 'Отчет по табелям';
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
                    <Header as='h2' floated='left' style={{ marginBottom: 0 }} color='blue'>Отчет по табелям</Header>
                  </Table.HeaderCell>
                  <Table.HeaderCell textAlign='center'>
                    <Button
                      basic
                      color='blue'
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

export default withTranslation(TablesReport);