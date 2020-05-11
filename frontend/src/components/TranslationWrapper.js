import React, { useState, createContext, useEffect } from "react";
import SafeJSON from '../helpers/json';

//  https://stackoverflow.com/questions/41030361/how-to-update-react-context-from-inside-a-child-component
const TranslationContext = createContext({
    keys: [],
    onSave: () => { },
    onExport: () => { },
    onImport: () => { },
    onDiscard: () => { },
    onUpdate: (key, value) => { },
    get: (key) => { },
    refresh: () => { }
});

const withTranslation = Component => {
    return props => {
        return (
            <TranslationContext.Consumer>
                {(translation) => {
                    return <Component {...props} translation={translation} />;
                }}
            </TranslationContext.Consumer>
        );
    };
};

const keys = [
    "ТС",
    "Технические средства",

    "Год получения",
    "Год ввода в эксплуатацию",
    "Год вывода из эксплуатации",

    "Инв. номер",
    "Отв. за эксплуатацию",

    "Тип ТС",
    "Назначение ТС",
    "Обрабатываемая информация",
    "Табель",
    "Пункт табеля",
    "Подразделение",
];

const TranslationWrapper = ({ children }) => {
    const [translation, setTranslation] = useState({})

    const refresh = () => {
        let data = SafeJSON.parse(localStorage.getItem("translation") || "{}", {});
        onImport(data);
    }

    const onImport = (data) => {
        let newTranslation = { ...translation }
        keys.forEach(key => newTranslation[key] = data[key] || key);
        setTranslation(newTranslation)
    }

    const onExport = () => {
        return JSON.stringify(translation);
    }

    const onSave = () => {
        localStorage.setItem("translation", JSON.stringify(translation));
    }

    const onDiscard = () => {
        onImport({})
    }

    const onUpdate = (key, value) => {
        let newTranslation = { ...translation }
        newTranslation[key] = value;
        setTranslation(newTranslation)
    }

    useEffect(() => {
        refresh();
    }, [])

    return (
        <TranslationContext.Provider value={{
            keys, refresh,
            onImport, onUpdate, onExport, onSave, onDiscard,
            get: (key) => translation[key] == undefined ? key : translation[key]
        }}>
            <React.Fragment>
                {children}
            </React.Fragment>
        </TranslationContext.Provider>
    );
}

export { TranslationWrapper, TranslationContext, withTranslation }