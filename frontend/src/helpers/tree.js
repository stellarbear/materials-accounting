// convert flat array to tree object
export const list_to_tree = (list, idAttr = 'id', parentAttr = 'parent', childrenAttr = 'children') => {
  const treeList = [];
  const lookup = {};
  list.forEach(function (obj) {
    lookup[obj[idAttr]] = obj;
    obj[childrenAttr] = [];
  });
  list.forEach(function (obj) {
    if (obj[parentAttr] != null) {
      lookup[obj[parentAttr].id][childrenAttr].push(obj);
    } else {
      treeList.push(obj);
    }
  });
  return treeList;
};

// check element with id === parentID is parent of childID in list
export const is_parent = (list, parentID, childID) => {
  if (!childID) return false;
  let parent = list.find(elem => elem.id === parentID);
  let child = list.find(elem => elem.id === childID);
  if (child.id === parent.id) {
    return true;
  }
  if (!child || !parent) {
    return false;
  }
  while (child.parent !== null) {
    if (parent.id === child.parent.id) {
      return true;
    }
    childID = child.parent.id;
    // eslint-disable-next-line
    child = list.find(elem => elem.id === childID);
  }
  return false;
}