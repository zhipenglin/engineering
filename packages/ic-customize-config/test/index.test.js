const fs = require('fs'),
    loadJsonFile = require('load-json-file'),
    customizeConfig = require('../index'),
    path = require('path');

jest.mock('fs');
jest.mock('load-json-file');

describe('ic-customize-config/index.js', () => {
    beforeEach(() => {
        fs.realpathSync.mockReturnValue('./');
        fs.existsSync.mockReturnValue(true);
        loadJsonFile.sync.mockReturnValue({
            "updateList": [
                "newcommon"
            ],
            "all": [
                "valeo",
                "tianhua",
                "greentown",
                "newcommon",
                "autoliv",
                "globalegrow",
                "vanke"
            ],
            "features": {
                "newcommon": [
                    "template",
                    "boleSort",
                    "accountUpgrade"
                ],
                "globalegrow": [
                    "newcommon"
                ],
                "autoliv": [
                    "newcommon"
                ],
                "vanke": [
                    "template"
                ]
            }
        });
    });
    it('正确配置文件解析', () => {
        const config = customizeConfig({cacheOpen: false});
        expect(config.updateList).toEqual(['newcommon']);
        expect(config.features).toEqual(expect.arrayContaining(['template', 'accountUpgrade', 'boleSort']));
    });
    it('updateList有非法值', () => {
        loadJsonFile.sync.mockReturnValue({
            "updateList": ["abc", "valeo"],
            "all": [
                "newcommon",
                "valeo"
            ]
        });
        const config = customizeConfig({cacheOpen: false});
        expect(config.updateList).toEqual(expect.arrayContaining(['valeo']));
        expect(config.updateList).toEqual(expect.not.arrayContaining(['abc']));
    });
    it('updateList不是一个数组', () => {
        loadJsonFile.sync.mockReturnValue({
            "updateList": "abc",
            "all": [
                "newcommon",
                "valeo"
            ]
        });
        const config = customizeConfig({cacheOpen: false});
        expect(config.updateList).toEqual([]);
    });
    it('updateList设置为*',()=>{
        loadJsonFile.sync.mockReturnValue({
            "updateList": "*",
            "all": [
                "newcommon",
                "valeo"
            ]
        });
        const config = customizeConfig({cacheOpen: false});
        expect(config.updateList).toEqual(config.all);
    });
    it('all不是一个数组',()=>{
        loadJsonFile.sync.mockReturnValue({
            "updateList": "*",
            "all": "abc"
        });
        const config = customizeConfig({cacheOpen: false});
        expect(config.all).toEqual(['common']);
    });
    it('all传入common',()=>{
        loadJsonFile.sync.mockReturnValue({
            "updateList": "*",
            "all": [
                "common",
                "newcommon"
            ]
        });
        const config = customizeConfig({cacheOpen: false});
        expect(config.all).toEqual(['common','newcommon']);
    });
    it('customizePath设置', () => {
        const mockCallback = jest.fn(() => ({}));
        loadJsonFile.sync.mockImplementation(mockCallback);
        const config = customizeConfig({configPath: './src/customize.json'});
        expect(mockCallback.mock.calls[0][0]).toBe(path.resolve(process.cwd(), './src/customize.json'));
    });
    it('配置文件不存在', () => {
        fs.existsSync.mockReturnValue(false);
        const config = customizeConfig({cacheOpen: false});
        expect(config.origin).toEqual({});
        expect(config.all).toEqual(['common']);
        expect(config.updateList).toEqual([]);
        expect(config.features).toEqual([]);
    });
    it('配置文件读取失败',()=>{
        loadJsonFile.sync.mockImplementation(()=>{
            throw new Error('文件读取失败');
        });
        const config = customizeConfig({cacheOpen: false});
    });
    it('获取特性', () => {
        const config = customizeConfig({cacheOpen: false});
        expect(config.getFeatures('newcommon')).toEqual(expect.arrayContaining(["template", "boleSort", "accountUpgrade"]));
        expect(config.getFeatures('abc')).toEqual([]);
    });
    it('格式化updateList', () => {
        const config = customizeConfig({cacheOpen: false});
        expect(config.formatUpdateList(['newcommon', 'valeo', 'common'])).toEqual(expect.arrayContaining(['newcommon', 'valeo', 'common']));
        expect(config.formatUpdateList(['newcommon', 'abc'])).toEqual(expect.not.arrayContaining(['abc']));
        expect(config.formatUpdateList(['newcommon', 'abc'])).toEqual(expect.arrayContaining(['newcommon']));
    });
    it('格式化target', () => {
        const config = customizeConfig({cacheOpen: false});
        expect(config.formatTarget('newcommon')).toBe('newcommon');
        expect(config.formatTarget('abc')).toBe('common');
    });
    it('格式化特性', () => {
        const config = customizeConfig({cacheOpen: false});
        expect(config.formatFeature('template')).toBe('template');
        expect(config.formatFeature('abc')).toBe('');
        expect(config.formatFeature('newcommon')).toBe('');
    });
    it('开启缓存', () => {
        const mockCallback = jest.fn(() => ({}));
        loadJsonFile.sync.mockImplementation(mockCallback);
        const config = customizeConfig(), config2 = customizeConfig();
        expect(mockCallback.mock.calls.length).toBe(1);
        expect(config.value).toEqual(config2.value);
    });
});
