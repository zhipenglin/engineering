/**
 * @name: ic-customize-config ;
 * @author: admin ;
 * @description: Parsing the customize file ;
 * */
const fs = require('fs'),
    loadJsonFile = require('load-json-file'),
    {paths} = require('@engr/ic-scripts-util'),
    path = require('path'),
    get = require('lodash/get'),
    chalk = require('chalk'),
    uniq = require('lodash/uniq'),
    flatten = require('lodash/flatten'),
    difference = require('lodash/difference'),
    intersection = require('lodash/intersection');

const cache = {};

class CustomizeConfig {
    constructor(options) {

        this.getFeatures = this.getFeatures.bind(this);
        this.formatUpdateList = this.formatUpdateList.bind(this);
        this.formatTarget = this.formatTarget.bind(this);
        this.formatFeature = this.formatFeature.bind(this);

        const {configPath, cacheOpen} = Object.assign({cacheOpen: true}, options);

        if (configPath) {
            this.customizePath = path.resolve(paths.appRoot, configPath);
        } else {
            this.customizePath = paths.customizeConfig;
        }
        this.origin = {};
        if (cacheOpen && cache[this.customizePath]) {
            Object.keys(cache[this.customizePath]).forEach((key) => this[key] = cache[this.customizePath][key]);
            return this;
        }
        if (fs.existsSync(this.customizePath)) {
            this.isCustomize = true;
            try {
                this.origin = loadJsonFile.sync(this.customizePath);
                const featureConfig = {};
                fs.readdirSync(paths.appFeature).forEach((name) => {
                    const featureConfigPath = path.resolve(paths.appFeature, name, 'featureConfig.json');
                    if (fs.existsSync(featureConfigPath)) {
                        featureConfig[name] = loadJsonFile.sync(featureConfigPath);
                    }
                });
                Object.assign(this.origin.features,featureConfig);
            } catch (e) {
                console.log(chalk.red(e.message));
            }
        } else {
            this.isCustomize = false;
        }

        this.all = get(this.origin, 'all', []);
        this.updateList = get(this.origin, 'updateList', []);

        if (!Array.isArray(this.all)) {
            console.log(chalk.red('property all must be an array'));
            this.all = [];
        }

        if (this.all.indexOf('common')) {
            this.all.splice(0, 0, 'common');
        }

        if (this.updateList === '*') {
            this.updateList = this.all.slice(0);
        }

        if (!Array.isArray(this.updateList)) {
            console.log(chalk.red('property updateList must be an array'));
            this.updateList = [];
        }

        this.freezeList = [], this.activeList = this.all;
        if (fs.existsSync(paths.appFeature)) {
            const freezeList = fs.readdirSync(paths.appFeature).filter((name) => {
                return fs.existsSync(path.resolve(paths.appFeature, name, 'original.json'));
            });
            this.freezeList = intersection(this.all, freezeList);
            this.activeList = this.all.filter((name) => this.freezeList.indexOf(name) == -1||name==='common');
        }

        this.updateList = this.formatUpdateList(this.updateList);
        this.features = difference(uniq(flatten(Object.values(get(this.origin, 'features', {})))), this.all);

        if (cacheOpen) {
            cache[this.customizePath] = {
                all: this.all,
                isCustomize: this.isCustomize,
                origin: this.origin,
                updateList: this.updateList,
                features: this.features,
                freezeList:this.freezeList,
                activeList:this.activeList
            };
        }
    }

    get value() {
        return {
            all: this.all,
            isCustomize: this.isCustomize,
            origin: this.origin,
            updateList: this.updateList,
            features: this.features,
            freezeList:this.freezeList,
            activeList:this.activeList
        };
    }

    getFeatures(name) {
        return get(this.origin, `features[${this.formatTarget(name)}]`, []);
    }

    formatUpdateList(list) {
        return intersection(this.activeList, list);
    }

    formatTarget(target) {
        if (this.all.indexOf(target) > -1) {
            return target;
        } else {
            return 'common';
        }
    }

    formatFeature(name) {
        return this.features.indexOf(name) > -1 ? name : '';
    }
}

module.exports = (...args) => new CustomizeConfig(...args);
