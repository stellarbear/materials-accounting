import React from 'react';
import {Grid, Icon, Menu, Segment} from 'semantic-ui-react';
import Filters from '../../components/Filters';
import TsReport from './_ts_report';
import TablesReport from './_tables_report';

class Report extends React.Component {

  state = {
    activePanel: 'tsReport',
    count: 0,
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

  handleMenuClick = (e, {name}) => this.setState({activePanel: name});

  renderMainContent = () => {
    const {activePanel, filter} = this.state;
    if (activePanel === 'tsReport') {
      return <TsReport filter={filter}/>
    }
    if (activePanel === 'tablesReport') {
      return <TablesReport filter={filter} />
    }
  };

  render = () => {
    const {activePanel} = this.state;
    return (
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}>
              <Segment color='teal'>
                <Filters
                    searchClick={(filter) => this.setState({filter})}
                    countUpdate={(count) => this.setState({count})}
                    isReport={true}
                />
              </Segment>
            </Grid.Column>
            <Grid.Column width={8}>
              {this.renderMainContent()}
            </Grid.Column>
            <Grid.Column width={2}>
              <Menu vertical color='teal' icon='labeled'>
                <Menu.Item
                    name='tsReport'
                    active={activePanel === 'tsReport'}
                    onClick={this.handleMenuClick}
                >
                  <Icon name='desktop'/>
                  Отчет по ТС
                </Menu.Item>
                <Menu.Item
                    name='tablesReport'
                    active={activePanel === 'tablesReport'}
                    onClick={this.handleMenuClick}
                >
                  <Icon name='book'/>
                  Отчет по табелям
                </Menu.Item>
              </Menu>
            </Grid.Column>
          </Grid.Row>
        </Grid>
    );
  }
}

export default Report;