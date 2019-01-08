module.exports=(string)=>{
    const index=string.lastIndexOf('@');
    if(index>0){
        return {
            name:string.substr(0,index),
            version:string.substr(index+1)
        };
    }else{
        return {
            name:string
        };
    }
};
