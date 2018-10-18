## ic-customize-cache

描述：打包缓存

1. 将当前的打包结果，也就是build目录，写入缓存和缓存合并
2. 将合并后的结果拷贝进当前build目录
3. 检查当前的build目录中的结果是否完整

创建人：admin

创建时间：2018年08月29日 09:39

仓库地址: git@gitlab.zhinanzhen.wiki:frontend/common/engineering.git

[gitlab](http://gitlab.zhinanzhen.wiki/frontend/common/engineering)

-----------

### 安装

```sh
npm i @engr/ic-customize-cache
```

### 使用

1. 只能在定制项目中使用，即项目根目录存在custimize.json配置文件
2. 配置环境变量CACHE_DIR，设置缓存目录

```sh
customize-cache
```

-----------

### Blog:

- 2018年08月29日 09:39：**admin** 创建组件
