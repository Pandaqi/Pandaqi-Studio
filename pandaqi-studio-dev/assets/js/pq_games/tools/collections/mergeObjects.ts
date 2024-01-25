
// @NOTE: The item.constructor.name is used to exclude any class instances we want to preserve
const isObject = (item) => 
{
  return (item && typeof item === 'object' && !Array.isArray(item) && item.constructor.name === "Object");
}

const mergeObjects = (target, ...sources) => 
{
    if (!sources.length) return target;
    const source = sources.shift();
  
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeObjects(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  
    return mergeObjects(target, ...sources);
}

export default mergeObjects;