const fs = require('fs-extra'),
    run = require('../scripts/run'),
    customizeConfig = require('@engr/ic-customize-config');

jest.mock('fs-extra');
jest.mock('@engr/ic-customize-config');

describe('ic-customize-cache/bin/customize-cache.js', () => {
    beforeEach(() => {
        process.env.CACHE_DIR = './build-cache';
        fs.realpathSync.mockReturnValue('./');
        customizeConfig.mockReturnValue({
            isCustomize: true,
            all: ['newcommon', 'common'],
            formatUpdateList: (list) => list
        });
    });
    it('环境变量CACHE_DIR没有配置', async () => {
        delete process.env.CACHE_DIR;
        try {
            await run();
        } catch (e) {
            expect(e.message).toBe('缓存目录不存在，请检查环境变量CACHE_DIR是否已经配置');
        }
    });
    it('非定制类型项目', async () => {
        customizeConfig.mockReturnValue({
            isCustomize: false,
            all: ['common'],
            formatUpdateList: (list) => list
        });
        await run();
    });
    it('build目录没有合法文件', async () => {
        fs.readdir.mockReturnValue([]);
        await run();
    });

    it('正常执行代码',async ()=>{
        fs.readdir.mockReturnValue(['newcommon','common']);
        fs.stat.mockResolvedValue({
            isDirectory:()=>true
        });
        fs.emptyDir.mockResolvedValue()
        await run();
    });
    it('代码完整性检查失败',async ()=>{
        fs.readdir.mockReturnValue(['newcommon','common']);
        fs.stat.mockResolvedValue({
            isDirectory:()=>true
        });
        fs.exists.mockResolvedValue(false);
        fs.emptyDir.mockResolvedValue()
        try {
            await run();
        } catch (e) {
            expect(e.message).toBe('当前build目录缺少newcommon，请先执行全量打包');
        }
    });

});
