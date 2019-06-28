# xcxSku
小程序sku组合组件封装

![demo](https://github.com/nuo1693/xcxSku/blob/master/demo.gif)
## 1.在json引用
```
"usingComponents": {
    "sku": "../../component/sku/sku"
},
```
## 2.wxml引入

其中 `<sku id='sku' class='body' bind:bubble='bubble'></sku>`为引入的，其他可根据需求处理
```
<!-- sku组合 -->
<view class='sku' hidden='{{!skuFlag}}'>
		<view class='head'>
				<image class='img' src='{{ imgUrl }}{{ goodsConfig.url }}' lazy-load />
				<view class='number'>x{{goodsConfig.goodsNumber}}</view>
				<view class='center'>
						<view class='price' hidden='{{ !goodsConfig.price > 0 }}'>
								¥{{ goodsConfig.price*goodsConfig.goodsNumber  }}
						</view>
						<view class='attr'>{{ goodsConfig.attr }}</view>
				</view>
				<image class='img2' src='{{ newImgUrl }}home/icon/close.png' lazy-load catchtap='clickPup' />
				<view class='line'></view>
		</view>
		<sku id='sku' class='body' bind:bubble='bubble'></sku>
		<view class='footer'>
				<button class='buy' catchtap='makeSure'>确定</button>
				<button class='cart' catchtap='addCart'>加入购物车</button>
		</view>
</view>
<!-- sku组合 end -->
```



## 3.js文件
#### 获取sku
```
onReady() {
    this.sku = this.selectComponent('#sku')
},
```



#### 获取初始化  传入组合商品信息  that.sku.load()

```
第一个参数为(必传)   例如下面的data
[
    {"规格":"款式A衣柜：900*560*2000mm","材质":"白橡+桐木","颜色":"原木色","skuId":6494},
    {"规格":"款式B衣柜：900*560*2000mm","材质":"白橡+桐木","颜色":"原木色","skuId":6495}
]
```

```
第二个参数为skuId(必传)
```

```
第三个参数为是否有数量的选择(可不传)
```

```
第四个参数为数量个数(可不传)

```

```
举个栗子
that.sku.load(data, that.data.goodsConfig.skuId, true, that.data.goodsConfig.goodsNumber)
```


```
sku组件冒泡  更新引用的js的操作状态
bubble(e){}
```



