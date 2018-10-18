const spawn = require('cross-spawn'),
    customizeConfig = require('@engr/ic-customize-config'),
    list=require('../index');

jest.mock('cross-spawn');
jest.mock('@engr/ic-customize-config');

describe('ic-gitlib-update-list/index.js', () => {
    it('非定制项目运行', () => {
        spawn.sync.mockReturnValue('');
        customizeConfig.mockReturnValue({
            isCustomize:false
        });
        expect(list()).toEqual([]);
    });
    it("定制项目运行,未识别到标识符",()=>{
        spawn.sync.mockReturnValue({
            stdout:'xxxx',
            status:0
        });
        customizeConfig.mockReturnValue({
            isCustomize:true,
            formatUpdateList:(item)=>item
        });
        expect(list()).toEqual([]);
    });
    it("定制项目运行,识别到标识符",()=>{
        spawn.sync.mockReturnValue({
            stdout:"Merge branch 'dev' into 'release/20180828'\nDevasdasdsad ${valeo,newcommon}\n\nSee merge request !13",
            status:0
        });
        customizeConfig.mockReturnValue({
            isCustomize:true,
            formatUpdateList:(item)=>item
        });
        expect(list()).toEqual(['valeo', 'newcommon']);
    });
    it("定制项目运行,解析全部",()=>{
        spawn.sync.mockReturnValue({
            stdout:"Merge branch 'dev' into 'release/20180828'\nDevasdasdsad ${*}\n\nSee merge request !13",
            status:0
        });
        customizeConfig.mockReturnValue({
            all:[
                'common','valeo', 'newcommon'
            ],
            isCustomize:true,
            formatUpdateList:(item)=>item
        });
        expect(list()).toEqual(['common','valeo', 'newcommon']);
    });
});
