export const pick = (obj, props) => {
  const newObj = {};
  props.forEach(prop => {
    if (obj.hasOwnProperty(prop)) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
}

export const omit = (obj, props) => {
  const newObj = { ...obj };
  props.forEach((prop) => {
    delete newObj[prop]
  });
  return newObj;
}