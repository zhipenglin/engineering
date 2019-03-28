import loadable from '@loadable/component';
import { matchPath } from 'react-router-dom';

const route = {
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

export default route;

const serverRoute = {
<%= Object.keys(data).map((key)=>{
        const item=data[key];
        const itemStr = Object.keys(item).map((key)=>{
            const value=item[key];
            if(key === 'component'){
                return `    "component" : () => import("${value}")`
            }
            return `    "${key}" : ${typeof value === 'string' ? `"${value}"` : value}`
        }).join(',\n');
        return `  "${key}" : {
${itemStr}
  }`
    }).join(',\n') %>
};

export const getInitialProps= (url) =>{
  const activeRoute = Object.values(serverRoute).find((route) => matchPath(url, route));
  if(activeRoute){
    return activeRoute.component().then(({ default: Page }) => {
      if (Page.getInitialProps) {
        return Page.getInitialProps().then(({ data }) => {
          return data;
        });
      }
    });
  }
};