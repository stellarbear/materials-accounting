import React, { Component } from 'react';
import { TransitionablePortal, Message, Menu, Dropdown, Icon, Modal, Button, Loader, Checkbox, Popup } from 'semantic-ui-react';
import { is_parent } from '../helpers/tree';
import { withRouter } from 'react-router';
import { withApollo } from 'react-apollo';
import { Query } from 'react-apollo';
import { fileDownload, fileUpload } from '../helpers/file';
import gql from 'graphql-tag';
import './../styles/Menu.css'
import { withTranslation } from '../components/TranslationWrapper';

const reloadTimeout = 1280

export const EXPORT_TS_QUERY = gql`
  query ($id: String!, $exportPrivate: Boolean!) {
    exportTS(id: $id, exportPrivate: $exportPrivate)
  }
`;
export const EXPORT_UNIT_QUERY = gql`
  query ($id: String!, $exportPrivate: Boolean!) {
    exportUnit(id: $id, exportPrivate: $exportPrivate)
  }
`;
export const EXPORT_DB_QUERY = gql`
  query ($exportPrivate: Boolean!){
    exportDB(exportPrivate: $exportPrivate)
  }
`;
export const EXPORT_DICTS_QUERY = gql`
  query{
    exportDicts
  }
`;
export const IMPORT_DB_MUTATION = gql`
  mutation ($input: String!){
    importDB(input: $input)
  }
`;
export const IMPORT_TS_MUTATION = gql`
  mutation ($id: String!, $input: String!){
    importTS(id: $id, input: $input)
  }
`;
export const IMPORT_DICTS_MUTATION = gql`
  mutation ($input: String!){
    importDicts(input: $input)
  }
`;
export const IMPORT_UNIT_MUTATION = gql`
  mutation ($input: String!){
    importUnit(input: $input)
  }
`;
export const WIPE_UNIT_MUTATION = gql`
  mutation ($id: String!){
    wipeUnit(id: $id)
  }
`;
export const WIPE_DB_MUTATION = gql`
  mutation {
    wipeDB
  }
`;
export const WIPE_TS_MUTATION = gql`
  mutation {
    wipeTS
  }
`;
export const CONVERT_QUERY = gql`
  query ($input: String!, $type: String!) {
    convert(input:$input, type:$type)
  }
`;

const UNITS_QUERY = gql`
  {
    allUnits {
        id
        name
        parent {
            id
            name
        }
        fullPath
    }
  }
`;

class Management extends Component {
    state = {
        exportPrivate: false,
        importFileName: "",
        showPortal: false,
        showMock: false,
        showModal: false,
        removeHandle: () => { },
        removeItem: "",
        isNegative: false,
        message: "",
        importDBFileName: "",
    };

    showError = (message) => this.showMessage(message, true);
    showMessage = (message, isNegative = false) => {
        this.setState({
            showPortal: true,
            isNegative,
            message
        });
    }

    onConvert = async (e, type) => {
        this.setState({ showMock: true })
        const { client } = this.props;
        try {
            const file = e.target.files[0]
            const input = await fileUpload(file);
            const { data } = await client.mutate({
                mutation: CONVERT_QUERY,
                variables: { input, type }
            })

            const filename = `converted-${file.name}`;
            fileDownload(data.convert, filename, 'text/plain');

            this.showMessage(`Файл сконвертирован`);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({
                showMock: false,
                importDBFileName: ''
            })
        }
    }

    onDBImport = async (e) => {
        this.setState({ showMock: true })
        const { client } = this.props;
        try {
            const input = await fileUpload(e.target.files[0]);
            const { data } = await client.mutate({
                mutation: IMPORT_DB_MUTATION,
                variables: { input }
            })
            const date = new Date(parseInt(data.importDB)).toLocaleString()
            this.props.history.push(`/`);
            this.showMessage(`БД восстановлена от ${date}`);
            setTimeout(() => window.location.reload(), reloadTimeout);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({
                showMock: false,
                importDBFileName: ''
            })
        }
    }

    onUnitImport = async (e) => {
        this.setState({ showMock: true })
        const { client } = this.props;
        try {
            const input = await fileUpload(e.target.files[0]);
            const { data } = await client.mutate({
                mutation: IMPORT_UNIT_MUTATION,
                variables: { input }
            })
            const date = new Date(parseInt(data.importUnit)).toLocaleString()
            this.props.history.push(`/`);
            this.showMessage(`Импортирована база ${this.props.translation.get("Подразделение")} от ${date}`);
            setTimeout(() => window.location.reload(), reloadTimeout);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({
                showMock: false,
                importDBFileName: ''
            })
        }
    }

    onTSImport = async (e, unit) => {
        this.setState({ showMock: true })
        const { client } = this.props;
        const { key, text } = unit;
        try {
            const input = await fileUpload(e.target.files[0]);
            const { data } = await client.mutate({
                mutation: IMPORT_TS_MUTATION,
                variables: { input, id: key }
            })
            const date = new Date(parseInt(data.importTS)).toLocaleString()
            this.props.history.push(`/`);
            this.showMessage(`${text}: Импортированы ТС от ${date}`);
            setTimeout(() => window.location.reload(), reloadTimeout);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({
                showMock: false,
                importDBFileName: ''
            })
        }
    }

    onUnitWipe = async (unit) => {
        this.setState({ showMock: true })
        const { client } = this.props;
        const { key, text } = unit;
        try {
            await client.mutate({
                mutation: WIPE_UNIT_MUTATION,
                variables: { id: key }
            })
            this.props.history.push(`/`);
            this.showMessage(`${text}: Очищена таблица ${this.props.translation.get("ТС")}`);
            setTimeout(() => window.location.reload(), reloadTimeout);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({ showMock: false })
        }
    }

    onTSWipe = async () => {
        this.setState({ showMock: true })
        const { client } = this.props;
        try {
            await client.mutate({
                mutation: WIPE_TS_MUTATION,
            })
            this.props.history.push(`/`);
            this.showMessage(`Очищены технические средства`);
            setTimeout(() => window.location.reload(), reloadTimeout);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({ showMock: false })
        }
    }

    onDBWipe = async () => {
        this.setState({ showMock: true })
        const { client } = this.props;
        try {
            await client.mutate({
                mutation: WIPE_DB_MUTATION,
            })
            this.props.history.push(`/`);
            this.showMessage(`Очищена БД`);
            setTimeout(() => window.location.reload(), reloadTimeout);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({ showMock: false })
        }
    }

    onTSExport = async (unit) => {
        this.setState({ showMock: true })
        const { client } = this.props;
        try {
            const { data } = await client.query({
                query: EXPORT_TS_QUERY,
                variables: { id: unit.key, exportPrivate: this.state.exportPrivate }
            });

            const response = JSON.parse(data.exportTS);
            const filename = `${response.time}-${unit.text}-ts.json`;
            fileDownload(data.exportTS, filename, 'text/plain');
            this.showMessage(`База ${this.props.translation.get("ТС")} сохранена локально - ${filename}`);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({ showMock: false })
        }
    }

    onUnitExport = async (unit) => {
        this.setState({ showMock: true })
        const { client } = this.props;
        try {
            const { data } = await client.query({
                query: EXPORT_UNIT_QUERY,
                variables: { id: unit.key, exportPrivate: this.state.exportPrivate }
            });

            const response = JSON.parse(data.exportUnit);
            const filename = `${response.time}-${unit.text}-unit.json`;
            fileDownload(data.exportUnit, filename, 'text/plain');
            this.showMessage(`База ${this.props.translation.get("Подразделение")} сохранена локально - ${filename}`);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({ showMock: false })
        }
    }

    onDBExport = async () => {
        this.setState({ showMock: true })
        const { client } = this.props;
        try {
            const { data } = await client.query({
                query: EXPORT_DB_QUERY,
                variables: { exportPrivate: this.state.exportPrivate }
            });
            const response = JSON.parse(data.exportDB);
            const filename = `${response.time}-db.json`;
            fileDownload(data.exportDB, filename, 'text/plain');
            this.showMessage(`Дамп БД сохранён локально - ${filename}`);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({ showMock: false })
        }
    }

    onDictsImport = async (e) => {
        this.setState({ showMock: true })
        const { client } = this.props;
        try {
            const input = await fileUpload(e.target.files[0]);
            const { data } = await client.mutate({
                mutation: IMPORT_DICTS_MUTATION,
                variables: { input }
            })
            const date = new Date(parseInt(data.importDicts)).toLocaleString()
            this.props.history.push(`/`);
            this.showMessage(`Словари восстановлены от ${date}`);
            setTimeout(() => window.location.reload(), reloadTimeout);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({
                showMock: false,
                importDBFileName: ''
            })
        }
    }

    onDictsExport = async () => {
        this.setState({ showMock: true })
        const { client } = this.props;
        try {
            const { data } = await client.query({
                query: EXPORT_DICTS_QUERY,
            });
            const response = JSON.parse(data.exportDicts);
            const filename = `${response.time}-dicts.json`;
            fileDownload(data.exportDicts, filename, 'text/plain');
            this.showMessage(`Дамп словарей сохранён локально - ${filename}`);
        } catch (error) {
            this.showError(`Ошибка сервера - ${error}`);
        }
        finally {
            this.setState({ showMock: false })
        }
    }

    onModalClose = () => {
        this.setState({
            showModal: false,
            removeHandle: () => { },
            removeItem: ""
        })
    }

    onModalSubmit = () => {
        this.state.removeHandle();
        this.onModalClose();
    }

    render = () => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const platform = process.env.REACT_APP_PLATFORM || "web";

        const dictionaryFromStorage = localStorage.getItem('dictionaryAccess')
        const dictionaryAccess = (dictionaryFromStorage == "true" ? true : false);

        const { state, onTSWipe, onConvert, onDBExport, onDictsExport, onTSImport, onTSExport, onUnitWipe, onDBImport, onUnitExport, onDBWipe, onDictsImport, onUnitImport, onModalClose, onModalSubmit } = this;
        const { showPortal, isNegative, message, importDBFileName, showMock, showModal, removeItem, exportPrivate } = state;
        return (
            <React.Fragment>
                <Query query={UNITS_QUERY}>
                    {({ loading, error, data }) => {
                        if (loading) {
                            return (
                                <Dropdown
                                    disabled
                                    loading />
                            );
                        };
                        if (error) {
                            return (
                                <Dropdown
                                    disabled
                                    error />
                            );
                        }
                        let options = data.allUnits;
                        if (this.props.ommit) {
                            options = options.filter(elem => !is_parent(options, this.props.ommit, elem.id));
                        }
                        options = options.map(el => {
                            return {
                                key: el.id,
                                value: el.id,
                                text: el.fullPath.join(', ')
                            }
                        });
                        options.sort((a, b) => {
                            return a.text < b.text ? -1 : 1;
                        });
                        return (
                            <Dropdown simple direction='right' item trigger={<span><Icon name='book' />Управление данными</span>}>
                                <Dropdown.Menu>
                                    <Dropdown.Header style={{ display: "flex", alignItems: "center", justifyContent: 'space-between' }}>
                                        Экспорт
                                        <Popup
                                            trigger={<Checkbox
                                                style={{ fontSize: 12, textTransform: "none" }}
                                                label={'Внутренние'}
                                                checked={exportPrivate}
                                                onChange={() => this.setState({ exportPrivate: !exportPrivate })}
                                            />}
                                            content={'При экспорте записи с пометкой для внутреннего использования не экспортируются (поведение по умолчанию). Поставьте галочку, если хотите, чтобы указанные выше записи учитывались при экспорте.'}
                                            position='bottom center'
                                        />

                                    </Dropdown.Header>
                                    {platform === "web" &&
                                        <React.Fragment>
                                            <Dropdown.Item onClick={onDictsExport}>
                                                <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                                <span>Справочники</span>
                                            </Dropdown.Item>
                                            <Dropdown.Item disabled={!!!options.length}>
                                                <i aria-hidden="true" className="angle left icon"></i>
                                                <span>Подразделения (срез БД)</span>
                                                <Menu style={{ overflow: 'auto', maxHeight: 256 }} id="left-menu" >
                                                    <div style={{ marginRight: -120 }}>
                                                        {options.map(o =>
                                                            <Menu.Item
                                                                onClick={() => onUnitExport(o)}
                                                                key={`unit-export-${o.key}`}>
                                                                {o.text}
                                                            </Menu.Item>
                                                        )}
                                                    </div>
                                                </Menu>
                                            </Dropdown.Item>
                                            <Dropdown.Item disabled={!!!options.length}>
                                                <i aria-hidden="true" className="angle left icon"></i>
                                                <span>{`${this.props.translation.get("ТС")} (без справочников и подразделений)`}</span>
                                                <Menu style={{ overflow: 'auto', maxHeight: 256 }} id="left-menu" >
                                                    <div style={{ marginRight: -120 }}>
                                                        {options.map(o =>
                                                            <Menu.Item
                                                                onClick={() => onTSExport(o)}
                                                                key={`ts-export-${o.key}`}>
                                                                {o.text}
                                                            </Menu.Item>
                                                        )}
                                                    </div>
                                                </Menu>
                                            </Dropdown.Item>
                                        </React.Fragment>
                                    }
                                    <Dropdown.Item onClick={onDBExport}>
                                        <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                        <span>База данных</span>
                                    </Dropdown.Item>
                                    <Dropdown.Header>
                                        <hr style={{ marginBottom: 16, opacity: 0.4 }} />
                                        Импорт
                                    </Dropdown.Header>
                                    <Dropdown.Item as="label" htmlFor="importDicts">
                                        <React.Fragment>
                                            <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                            <span>Справочники (слияние)</span>
                                            <input hidden type="file" id="importDicts"
                                                onChange={onDictsImport} value={importDBFileName}
                                            />
                                        </React.Fragment>
                                    </Dropdown.Item>
                                    {platform === "web" &&
                                        <React.Fragment>
                                            <Dropdown.Item as="label" htmlFor="importUnit">
                                                <React.Fragment>
                                                    <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                                    <span>Подразделения (срез БД)</span>
                                                    <input hidden type="file" id="importUnit"
                                                        onChange={onUnitImport} value={importDBFileName}
                                                    />
                                                </React.Fragment>
                                            </Dropdown.Item>
                                            <Dropdown.Item disabled={!!!options.length}>
                                                <i aria-hidden="true" className="angle left icon"></i>
                                                <span>{`${this.props.translation.get("ТС")} (без справочников и подразделений)`}</span>
                                                <Menu style={{ overflow: 'auto', maxHeight: 256 }} id="left-menu" >
                                                    <div style={{ marginRight: -120 }}>
                                                        {options.map(o =>
                                                            <Menu.Item
                                                                key={`ts-import-${o.key}`}
                                                                as="label" htmlFor={`importTS-${o.key}`}>
                                                                {o.text}
                                                                <input hidden type="file" id={`importTS-${o.key}`}
                                                                    onChange={(e) => onTSImport(e, o)} value={importDBFileName}
                                                                />
                                                            </Menu.Item>
                                                        )}
                                                    </div>
                                                </Menu>
                                            </Dropdown.Item>
                                        </React.Fragment>
                                    }
                                    <Dropdown.Item as="label" htmlFor="importDB">
                                        <React.Fragment>
                                            <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                            <span>База данных</span>
                                            <input hidden type="file" id="importDB"
                                                onChange={onDBImport} value={importDBFileName}
                                            />
                                        </React.Fragment>
                                    </Dropdown.Item>
                                    <Dropdown.Header>
                                        <hr style={{ marginBottom: 16, opacity: 0.4 }} />
                                        Удаление
                                        </Dropdown.Header>
                                    <Dropdown.Item disabled={!!!options.length}>
                                        <i aria-hidden="true" className="angle left icon"></i>
                                        <span>{`${this.props.translation.get("ТС")} выбранного подразделения`}</span>
                                        <Menu style={{ overflow: 'auto', maxHeight: 256 }} id="left-menu">
                                            <div style={{ marginRight: -120 }}>
                                                {options.map(o =>
                                                    <Menu.Item
                                                        key={`unit-remove-${o.key}`}
                                                        onClick={() => this.setState({
                                                            showModal: true,
                                                            removeItem: o.text,
                                                            removeHandle: () => onUnitWipe(o)
                                                        })}>
                                                        {o.text}
                                                    </Menu.Item>
                                                )}
                                            </div>
                                        </Menu>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.setState({
                                        showModal: true,
                                        removeItem: `все ${this.props.translation.get("ТС")}`,
                                        removeHandle: () => onTSWipe()
                                    })}>
                                        <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                        <span>{`Все ${this.props.translation.get("ТС")}`}</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.setState({
                                        showModal: true,
                                        removeItem: "Базу данных",
                                        removeHandle: () => onDBWipe()
                                    })}>
                                        <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                        <span>База данных</span>
                                    </Dropdown.Item>
                                    {platform === "web" &&
                                        <React.Fragment>
                                            <Dropdown.Header>
                                                <hr style={{ marginBottom: 16, opacity: 0.4 }} />
                                                Конвертация
                                            </Dropdown.Header>
                                            <Dropdown.Item as="label" htmlFor="convertDB">
                                                <React.Fragment>
                                                    <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                                    <span>База данных</span>
                                                    <input hidden type="file" id="convertDB"
                                                        onChange={(e) => onConvert(e, "db")} value={importDBFileName}
                                                    />
                                                </React.Fragment>
                                            </Dropdown.Item>
                                            <Dropdown.Item as="label" htmlFor="convertDicts">
                                                <React.Fragment>
                                                    <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                                    <span>Справочники</span>
                                                    <input hidden type="file" id="convertDicts"
                                                        onChange={(e) => onConvert(e, "dicts")} value={importDBFileName}
                                                    />
                                                </React.Fragment>
                                            </Dropdown.Item>
                                            <Dropdown.Item as="label" htmlFor="convertTS">
                                                <React.Fragment>
                                                    <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                                    <span>Подразделения</span>
                                                    <input hidden type="file" id="convertTS"
                                                        onChange={(e) => onConvert(e, "ts")} value={importDBFileName}
                                                    />
                                                </React.Fragment>
                                            </Dropdown.Item>
                                        </React.Fragment>
                                    }
                                    <Dropdown.Header>
                                        <hr style={{ marginBottom: 16, opacity: 0.4 }} />
                                        Другое
                                    </Dropdown.Header>
                                    <Dropdown.Item onClick={() => this.props.history.push(`/translation`)}>
                                        <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                        <span>Конфигурация интерфейса</span>
                                    </Dropdown.Item>
                                    {["admin"].includes(currentUser.role) &&
                                        <Dropdown.Item onClick={() => {
                                            localStorage.setItem('dictionaryAccess', !dictionaryAccess);
                                            this.showMessage(`Редактирование справочников ${!dictionaryAccess ? 'Разрешено' : 'Запрещено'}`);
                                            setTimeout(() => window.location.reload(), reloadTimeout);
                                        }}>
                                            <i aria-hidden="true" className="angle left icon" style={{ visibility: "hidden" }}></i>
                                            <span>{
                                                dictionaryAccess == false
                                                    ? 'Разблокировать справочники'
                                                    : 'Заблокировать справочники'
                                            }</span>
                                        </Dropdown.Item>
                                    }
                                </Dropdown.Menu>
                            </Dropdown>)
                    }}
                </Query>
                <TransitionablePortal
                    open={showPortal}
                    onClose={() => this.setState({ showPortal: false })}
                    transition={{ animation: 'fly left', duration: 500 }}
                >
                    <Message
                        negative={isNegative}
                        positive={!isNegative}
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
                            <p style={{ whiteSpace: "pre-line" }}>{message}</p>
                        </Message.Content>
                    </Message>
                </TransitionablePortal>
                <Modal size='small' open={showModal} onClose={() => onModalClose()}>
                    <Modal.Header>Вы уверены, что хотите удалить?</Modal.Header>
                    <Modal.Content>
                        <p><b>{removeItem}</b></p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={() => onModalClose()}>Отмена</Button>
                        <Button onClick={() => onModalSubmit()} color='red'>Подтвердить</Button>
                    </Modal.Actions>
                </Modal>
                <TransitionablePortal open={showMock} transition={{ animation: 'scale', duration: 500 }}>
                    <Modal open={true} basic size='small'>
                        <Modal.Content>
                            <Loader active inline='centered' />
                        </Modal.Content>
                    </Modal>
                </TransitionablePortal>
            </React.Fragment >
        );
    }
}

export default withApollo(withRouter(withTranslation(Management)));