import React from 'react';
import { Input, Label, Table, Header, Button, TransitionablePortal, Message, Icon } from 'semantic-ui-react';
import { fileDownload, fileUpload } from '../helpers/file';
import { withTranslation } from '../components/TranslationWrapper';
import SafeJSON from '../helpers/json';


class Translation extends React.Component {
    state = {
        message: '',
        isNegative: false,
        showPortal: false,
        importFileName: ''
    }

    showError = (message) => this.showMessage(message, true);
    showMessage = (message, isNegative = false) => {
        this.setState({
            showPortal: true,
            isNegative,
            message
        });
    }

    updateState = (key, value) => {
        this.props.translation.onUpdate(key, value);
    }

    onExport = () => {
        fileDownload(this.props.translation.onExport(), 'translation.json', 'text/plain');
        this.showMessage("Схема успешно экспортирована")
    }

    onImport = async (e) => {
        try {
            const file = e.target.files[0]
            const input = await fileUpload(file);
            const data = SafeJSON.parse(input, {})
            this.props.translation.onImport(data);
            this.showMessage("Схема успешно импортирована")
        } catch (error) {
            this.showError(error)
        }
        finally {
            this.setState({ importFileName: '' })
        }
    }
    onSave = () => {
        this.props.translation.onSave();
        this.showMessage("Изменения сохранены")
    }
    onDiscard = () => {
        this.props.translation.onDiscard();
        this.showMessage("Восстановлены значения по умолчанию")
    }

    render = () => {
        return (
            <React.Fragment>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <div style={{
                        display: "flex",
                        width: "100%", maxWidth: 800,
                        margin: "16px 0px -16px 0px",
                        justifyContent: "flex-end"
                    }}>
                        <Button
                            style={{ marginBottom: 16, marginRight: 12 }}
                            color='red'
                            floated='right'
                            icon='delete'
                            content='Сбросить'
                            size='tiny'
                            onClick={() => this.onDiscard()} />
                        <Button
                            style={{ marginBottom: 16, marginRight: 12 }}
                            color='teal'
                            floated='right'
                            icon='save'
                            content='Сохранить изменения'
                            size='tiny'
                            onClick={() => this.onSave()}
                        />
                    </div>
                    <Table striped color='teal' style={{ maxWidth: 800 }}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell colSpan='3'>
                                    <Header as='h3' floated='left'>
                                        <div>
                                            Конфигурация интерфейса
                                        </div>
                                        <div style={{
                                            lineHeight: "normal",
                                            fontSize: "12px",
                                            width: "300px",
                                        }}>
                                            Чтобы изменения вступили в силу их необходимо сохранить (даже после сброса значений)!
                                        </div>
                                    </Header>
                                    <Button
                                        as="label"
                                        floated='right'
                                        size='tiny'>
                                        <i aria-hidden="true" className="upload icon"></i>
                                        <span>Импортировать схему</span>
                                        <input hidden type="file" id="importSchema"
                                            onChange={(e) => this.onImport(e)} value={this.state.importFileName}
                                        />
                                    </Button>
                                    <Button
                                        style={{ marginRight: 12 }}
                                        floated='right'
                                        icon='download'
                                        content='Экспортировать схему'
                                        size='tiny'
                                        onClick={() => this.onExport()}
                                    />
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {this.props.translation.keys.map(key => (
                                <Table.Row key={key}>
                                    <Table.Cell textAlign='right'>
                                        {key}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Input
                                            style={{ minWidth: 400 }}
                                            placeholder={key}
                                            value={this.props.translation.get(key)}
                                            onChange={e => this.updateState(key, e.target.value)}
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table >
                </div>

                <TransitionablePortal
                    open={this.state.showPortal}
                    onClose={() => this.setState({ showPortal: false })}
                    transition={{ animation: 'fly left', duration: 500 }}
                >
                    <Message
                        negative={this.state.isNegative}
                        positive={!this.state.isNegative}
                        size='small'
                        icon
                        style={{
                            right: '2%',
                            position: 'fixed',
                            top: '2%',
                            zIndex: 1000,
                            maxWidth: '30%'
                        }}
                    >
                        <Icon name='exclamation triangle' />
                        <br />
                        <Message.Content>
                            <p style={{ whiteSpace: "pre-line" }}>{this.state.message}</p>
                        </Message.Content>
                    </Message>
                </TransitionablePortal>
            </React.Fragment >
        );
    }
}

export default withTranslation(Translation)