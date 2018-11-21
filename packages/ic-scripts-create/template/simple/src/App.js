import React, {Component} from 'react';
import {Route} from 'react-router-dom'
import {Layout,Breadcrumb} from 'antd'
import LeftMenu from './modules/LeftMenu'
import './App.css';
import logo from './modules/img/logo-ico.b071a3d.svg'

const {Header,Content}=Layout;

class App extends Component {
    render() {
        return (
            <Layout className="App">
                <Header>
                    <img className="company-logo" src={logo}/>
                    <span>e成内推接口文档</span>
                    <span className="p-slogan">助力人才战略成功的AI平台</span>
                </Header>
                <Content style={{ padding: '0 30px' }}>
                    <Route path="/:id?" component={LeftMenu}/>
                </Content>
                <div className="p-footer">上海逸橙信息科技有限公司 Copyright © 2012 - 2019 沪ICP备12043691号-1沪公网安备 31010102002040 号</div>
            </Layout>
        );
    }
}

export default App;
