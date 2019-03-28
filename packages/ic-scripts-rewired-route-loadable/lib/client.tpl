import loadable from '@loadable/component';

export default {
<%= Object.keys(data).map((key)=>{
        const item=data[key];
        const itemStr = Object.keys(item).map((key)=>{
            const value=item[key];
            if(key === 'component'){
                return `    "${key}" : loadable(() => import("${value}"))`
            }
            return `    "${key}" : ${typeof value === 'string' ? `"${value}"` : value}`
        }).join(',\n');
        return `  "${key}" : {
${itemStr}
  }`
    }).join(',\n') %>
};