## 欢迎使用 engineering !

### 开始的一点小提示

- 您将得到一个最小可用的初始化应用程序，可以方便地进行业务开发，和部署到生产环境

- 运行 npm run start 可以在开发环境启动应用程序

- 运行 npm run build 执行构建，可以让您的应用程序可以部署在生产环境，不过通常情况，您不需要手动执行该命令，而是由gitlab-runner在远程服务器自动执行

- 运行 npm run docker-start 可以在生产环境环境启动应用程序，同样地，您不需要手动执行它，而是需要在启动docker容器的时候自动启动

- 运行 npm run daemon-start 可以在生产环境环境启动应用程序，当您的应用程序不在docker容器中部署的时候可以运行它，这时，应用程序将以守护进程模式启动

### 通过 overrides 让您的应用能适应更多的业务场景

在初始化应用之后，在根目录下有一个config-overrides.js文件，通过这个文件的设置，您可以覆盖掉默认的webpack配置；

默认情况下，会有一个rewiredServer的覆盖，以支持egg集成环境下开发环境的支持。当然我们并不推荐您直接在config-overrides.js中直接操作配置，除非该操作是非常特殊的，您应该先在engineering的rewired列表中寻找，有没有可以满足您需求的package，它们通常以ic-scripts-rewired-开头。如果您的需求不能被现有的package支持，您可以在 engineering 中新建一个package来完成您需要的功能，通过request提交给我们，这样可以在其他人也需要相同功能时，帮助其他人快速解决问题。当然，在你还不确定您的代码可以实现您想要的功能时，您可以将其暂时写到config-overrides.js文件中，但是这不是长久之计，只是为了能够快速验证您的代码是否能满足需要，一个开箱即用，配置可复用，通过简单配置就能适应复杂环境的工程化工具是我们的最终目的，一些好的想法永远不应该被分散在业务项目当中。

您可能需要适当切分您的需求，保证一个package只完成一件事情。这样做可以让您的package在更多的场景中被复用。

### engineering的rewired列表

@engr/ic-scripts-rewired-aliases  添加aliases   aliasesOptions:需要被添加的aliases

@engr/ic-scripts-rewired-babel 覆盖babel配置  babelOptions:babel配置项（注意，我们只做了浅合并plugins和presets将被完全覆盖而不是merge）

@engr/ic-scripts-rewired-customize 定制项目支持  customizeLoaderOptions: {test,postcssOptions,featureOptions} test:定制模块标志正则，默认/@p@([./])/g，postcssOptions:postcss参数默认为{},featureOptions:open,是否开启特性包，默认为false





