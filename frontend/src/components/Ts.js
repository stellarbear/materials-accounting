import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Label, List, Icon, Header, Accordion, Grid, Popup } from 'semantic-ui-react';
import StringLimit from './StringLimit';
import '../styles/Ts.css';

class Ts extends Component {

  renderTableDescription = (ts) => {
    return (
      <p>
        <b>Основание: </b>
        <StringLimit
          limit={150}
          text={`${ts.table.name}, ${ts.tableItem.name}`}
        />
      </p>
    );
  };

  render = () => {
    let ts = this.props.ts;
    let unitFullPath = [...ts.unit.fullPath];
    const unitName = unitFullPath.length ? unitFullPath[unitFullPath.length - 1] : '';
    if (unitName.toLowerCase().trim().search(/отдел$/) === -1) {
      unitFullPath = unitFullPath.map(unit => {
        return unit.replace(/тдел$/, 'тдела');
      });
    }
    if (unitName.toLowerCase().trim().search(/отделение$/) === -1) {
      unitFullPath = unitFullPath.map(unit => {
        return unit.replace(/тделение$/, 'тделения');
      });
    }
    
    const unitFullName = unitFullPath.reverse().join(' ');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    return (
      <Card fluid className='ts' color={ts.isBroken ? 'red' : 'teal'}>
        <Card.Content>
          <Card.Header floated='left'>
            <Link to={`/ts/${ts.id}`}>{ts.tsType.name}</Link>
            <Popup trigger={
              <Icon
                color={ts.isBroken ? 'red' : 'teal'}
                name={ts.isBroken ? 'times circle outline' : 'check circle outline'}
                inverted={ts.isBroken}
                size='small'
                style={{ marginLeft: '5px' }}
              />
            }
              content={ts.isBroken ? 'Неисправен' : 'Исправен'}
            />
            <Header as='h3' floated='right'>
              <Label basic color='blue'>
                {unitFullName}
              </Label>
              <Label color='orange'>
                {ts.infoType.name}
              </Label>
            </Header>
          </Card.Header>
          <Card.Meta><b>№ {ts.number}</b></Card.Meta>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Card.Description className='mb5'>
                  <p>
                    <b>{ts.tsPurpose.name}</b>
                  </p>
                </Card.Description>
                <Card.Description className='mb5'>
                  {
                    this.renderTableDescription(ts)
                  }
                </Card.Description>
                {this.renderChildren(ts)}
              </Grid.Column>
              <Grid.Column>
                <Card.Description className='mb10'>
                  <List>
                    <List.Item>
                      <List.Icon name='calendar alternate outline' />
                      <List.Content>
                        Год получения: {ts.receiptYear}
                      </List.Content>
                    </List.Item>
                    {
                      Boolean(ts.commissioningYear) && (
                        <List.Item>
                          <List.Icon name='calendar check outline' />
                          <List.Content>
                            Год ввода в эксплуатацию: {ts.commissioningYear}
                          </List.Content>
                        </List.Item>
                      )
                    }
                    {
                      Boolean(ts.decommissionYear) && (
                        <List.Item>
                          <List.Icon name='calendar times outline' />
                          <List.Content>
                            Год вывода из эксплуатации: {ts.decommissionYear}
                          </List.Content>
                        </List.Item>
                      )
                    }
                  </List>
                </Card.Description>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
        {currentUser.role !== 'user' && (<Card.Content extra>
          <Button
            as={Link}
            to={`/ts/update/${ts.id}`}
            basic
            color='teal'
            icon
            labelPosition='left'>
            <Icon name='edit outline' color='teal' />
            Изменить
            </Button>
          <Button basic color='red' icon labelPosition='right' onClick={this.props.handleDelete}>
            Удалить
              <Icon name='trash alternate outline' />
          </Button>
        </Card.Content>)}
      </Card>
    );
  };

  renderChildren = (ts) => {
    if (ts.complectation && ts.complectation.length) {
      const panels = [];
      panels.push({
        key: 'children',
        title: 'Комплектация',
        content: {
          content: (
            <List as='ul'>
              {ts.complectation.map((ts, index) => <List.Item key={index}> - {ts && ts.name}</List.Item>)}
            </List>
          ),
        },
      });
      let prop = {};
      if (this.props.complectation) {
        prop.activeIndex = 0;
      }
      return (
        <Card.Description>
          <Accordion {...prop} panels={panels} className='kit' />
        </Card.Description>
      );
    }
  }
}

export default Ts;