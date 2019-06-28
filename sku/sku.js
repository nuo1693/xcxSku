Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    skuId: {
      type: String,
      value: ''
    },
  },
  data: {
    data: [],
    // skuId: '3158055',
    skuId: '',
    skuName: "skuId",
    keys: [],
    list: {},
    spliter: '\u2299',
    result: {},
    message: '',
    highKeys: {},
    goodsNumber: 1,
    hasNumber: true,
  },

  methods: {
    //父组件加载该sku组件
    load(data,skuId,hasNumber=true, goodsNumber=1){
      let that = this
      that.data.data = data;
      that.data.skuId = skuId;
      // that.data.hasNumber = hasNumber
      // that.data.goodsNumber = goodsNumber
      // let skuId = "3158055";
      let isHas = false;
      for (let i = 0; i < that.data.data.length; i++) {
        if (skuId == that.data.data[i][that.data.skuName]) {
          isHas = true;
          break;
        }
      }
      that.data.skuId = isHas ? skuId : that.data.data[0][this.data.skuName];
      that.initData();
      that.setData({
        list: that.data.list,
        data: that.data.data,
        result: that.data.result,
        hasNumber,
        goodsNumber,
      });
      that.bubble()
    },

    powerset(arr) {
      let ps = [[]];
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0, len = ps.length; j < len; j++) {
          ps.push(ps[j].concat(arr[i]));
        }
      }

      return ps;
    },
    //init数据
    initData() {
      let that = this;
      that.data.result = {};
      that.data.keys = that.getAllKeys();
      for (let i = 0; i < that.data.keys.length; i++) {
        that.data.highKeys[that.data.keys[i]] = false;
      }
      that.data.list = that.computeAttr(this.data.data, this.data.keys);
      that.initSeleted(that.data.skuId);
      that.buildResult(that.data.list.items);
      that.updateStatus(that.getSelectedInfo());
      that.showResult();
    },

    //正常属性   把该组不是选中的active设置为false
    normalClick(key, value) {
      let that = this;
      for (let i in that.data.list.result[key]) {
        if (i != value.name) {
          that.data.list.result[key][i].active = false;
        } else {
          that.data.list.result[key][i].active = true;
        }
      }
    },
    //无效属性点击
    disableClick(key, value) {
      let that = this;
      that.data.list.result[key][value.name]["disabled"] = false;
      // 清空高亮行的已選屬性狀態（因爲更新的時候默認會跳過已選狀態）
      for (let i in that.data.list.result) {
        if (i != key) {
          for (let x in that.data.list.result[i]) {
            that.data.list.result[i][x].active = false;
          }
        }
      }
      that.updateStatus(that.getSelectedInfo());
    },
    //高亮行
    highLight: function () {
      let that = this;
      for (let key in this.data.list.result) {
        that.data.highKeys[key] = true;
        for (let attr in that.data.list.result[key]) {
          if (that.data.list.result[key][attr].active === true) {
            that.data.highKeys[key] = false;
            break;
          }
        }
      }
    },
  
    //点击事件处理
    handleActive: function (e) {
      let { key, value, index } = e.target.dataset;
      let that = this;
      if (value.disabled) {
        return false;
      }
      if (value.active == true) {
        that.data.list.result[key][index].active = false
        that.data.skuId = null
        let a = that.getSelectedInfo();
        that.updateStatus(a);
        that.highLight();
        that.showResult();

      } else {
        that.normalClick(key, value);
        let a = that.getSelectedInfo();
        that.updateStatus(a);
        that.highLight();
        that.showResult();
      }
      that.setData({
        list: that.data.list,
        data: that.data.data,
        result: that.data.result,
        skuId: that.data.skuId,
      });
      that.bubble()
    },
    //计算属性
    computeAttr(data, keys) {
      let allKeys = [];
      let result = {};

      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let values = [];

        for (let j = 0; j < keys.length; j++) {
          let key = keys[j];
          if (!result[key]) {
            result[key] = {};
          }

          if (!result[key][item[key]]) {
            result[key][item[key]] = {
              name: item[key],
              active: false,
              disabled: false
            };
          }
          values.push(item[key]);
        }

        allKeys.push({
          path: values.join(this.data.spliter),
          sku: item["skuId"]
        });
      }

      return {
        result: result,
        items: allKeys
      };
    },
    //获取所有属性
    getAllKeys() {
      let that = this;
      let arrKeys = [];
      for (let attribute in that.data.data[0]) {
        if (!that.data.data[0].hasOwnProperty(attribute)) {
          continue;
        }

        if (attribute !== that.data.skuName) {
          arrKeys.push(attribute);
        }
      }

      return arrKeys;
    },

    getAttruites(arr) {
      let result = [];
      for (let i = 0; i < arr.length; i++) {
        result.push(arr[i].path);
      }
      return result;
    },
    //生成所有子集是否可选
    buildResult(items) {
      let that = this;
      let allKeys = that.getAttruites(items);
      for (let i = 0; i < allKeys.length; i++) {
        let curr = allKeys[i];
        let sku = items[i].sku;
        let values = curr.split(that.data.spliter);
        let allSets = that.powerset(values);

        // 每個組合的子集
        for (let j = 0; j < allSets.length; j++) {
          let set = allSets[j];
          let key = set.join(that.data.spliter);

          if (that.data.result[key]) {
            that.data.result[key].skus.push(sku);
          } else {
            that.data.result[key] = {
              skus: [sku]
            };
          }
        }
      }
    },
    //获取选中的信息
    getSelectedInfo() {
      let that = this;
      let result = [];
      for (let attr in that.data.list.result) {
        let attributeName = "";
        for (let attribute in that.data.list.result[attr]) {
          if (that.data.list.result[attr][attribute].active === true) {
            attributeName = attribute;
          }
        }
        result.push(attributeName);
      }
      return result;
    },
    //更新所有属性状态
    updateStatus(selected) {
      let that = this;
      for (let i = 0; i < that.data.keys.length; i++) {
        let key = that.data.keys[i],
          data = that.data.list.result[key],
          hasActive = !!selected[i],
          copy = selected.slice();

        for (let j in data) {
          let item = data[j]["name"];
          if (selected[i] == item) {
            continue;
          }

          copy[i] = item;
          let curr = that.trimSpliter(
            copy.join(that.data.spliter),
            that.data.spliter
          );
          that.data.list.result[key][j]["disabled"] = that.data.result[curr]
            ? false
            : true;
        }
      }
    },
    //初始化选中，skuId 需要选中的skuId
    initSeleted(skuId) {
      let that = this
      for (let i in this.data.data) {
        if (that.data.data[i][that.data.skuName] == skuId) {
          for (let x in that.data.data[i]) {
            if (x !== that.data.skuName && x != 'price' && x != 'url') {
              that.data.list.result[x][that.data.data[i][x]].active = true;
            }
          }
          break;
        }
      }
    },
    //显示选中的信息
    showResult() {
      let that = this
      let result = that.getSelectedInfo();
      let s = [];
      for (let i = 0; i < result.length; i++) {
        let item = result[i];
        if (!!item) {
          s.push(item);
        }
      }

      if (s.length == that.data.keys.length) {
        let curr = that.data.result[s.join(that.data.spliter)];
        if (curr) {
          s = s.concat(curr.skus);
          that.data.skuId = curr.skus[0];
        }

        that.data.message = s.join("\u3000-\u3000");
      }
    },
    // 正则匹配⊙
    trimSpliter(str, spliter) {
      // ⊙abc⊙ => abc
      // ⊙a⊙⊙b⊙c⊙ => a⊙b⊙c
      let reLeft = new RegExp("^" + spliter + "+", "g");
      let reRight = new RegExp(spliter + "+$", "g");
      let reSpliter = new RegExp(spliter + "+", "g");
      return str.replace(reLeft, "").replace(reRight, "").replace(reSpliter, spliter);
    },
    //规格及数量操作冒泡
    bubble() {
      let { skuId, goodsNumber, message } = this.data
      this.triggerEvent('bubble',{ skuId ,goodsNumber,message })
    },
    //绑定减数量
    minusCount: function (e) {
      let that = this,
          {goodsNumber} = that.data
      if (goodsNumber <= 1) {
        return false;
      }
      goodsNumber = goodsNumber - 1;
      that.setData({
        goodsNumber
      })
      that.bubble()
    },
    //绑定加数量
    addCount: function (e) {
      let that = this,
          {goodsNumber} = that.data
      goodsNumber = goodsNumber + 1;
      that.setData({
        goodsNumber
      });
      that.bubble()
    },
  }
})