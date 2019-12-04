interface IEntity {
    id: string
    parent: string
}

// check element with id === parentID is parent of childID in list
const isParent = <T extends IEntity>(list: T[], parentID: string, childID: string) => {
    if (!childID) return false;
    if (parentID === childID) {
        return true;
    }
    let child = list.find((elem) => {
        return elem.id === childID;
    });

    let parent = list.find((elem) => {
        return elem.id === parentID;
    });

    while (child.parent !== null) {
        if (parent.id === child.parent) {
            return true;
        }
        child = list.find((elem) => {
            return elem.id === child.parent;
        });
    }
    return false;

}

const findChildren = <T extends IEntity>(list: T[], id: string): string[] => {
    const children: string[] = [];
    list.forEach((elem) => {
        if (isParent(list, id, elem.id)) {
            children.push(elem.id);
        }
    });
    return children;
}

export { isParent, findChildren };