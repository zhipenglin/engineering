## ic-customize-config

描述：Parsing the customize file

创建人：admin

创建时间：2018年07月25日 17:45

仓库地址: git@gitlab.zhinanzhen.wiki:frontend/common/engineering.git

[gitlab](http://gitlab.zhinanzhen.wiki/frontend/common/engineering)

-----------

### API描述

| 名称  | 参数列表 | 返回值 | 功能说明 |
| --- | ---- | --- | ---- |
|   getTarget  |    name  |   string  |   判断输入的string在配置文件中的all中是否存在，如果存在返回本身，不存在返回默认值common   |
| getFeatures | name | [] | 输入特性名，返回特性列表，如果特性名不存在，返回空数组|
| updateList | - | 解析后的配置文件中的updateList(已做完校验) |
| all | - | 解析后的配置文件中的all |


-----------

### Blog:

- 2018年07月25日 17:45：**admin** 创建组件
