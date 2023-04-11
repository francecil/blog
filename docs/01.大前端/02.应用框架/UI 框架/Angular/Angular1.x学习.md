---
title: Angular1.x学习
date: 2018-11-10 10:18:32
tags: 
  - Angular1.x
permalink: /pages/09b80f/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - Angular
---

## 简介

ng-app 指令告诉 AngularJS，`<div>` 元素是 AngularJS 应用程序 的"所有者"。

<!--more-->

ng-model 指令把输入域的值绑定到应用程序变量 name。

ng-bind 指令把应用程序变量 name 绑定到某个段落的 innerHTML。

ng-init 指令初始化 AngularJS 应用程序变量。 **一般不用。使用控制器去初始化**

```html
<div ng-app="" ng-init="firstName='John'">
 
<p>姓名为 <span ng-bind="firstName"></span></p>
 
</div>
```

AngularJS 模块定义应用:
```js
var app = angular.module('myApp', []);
```
AngularJS 控制器控制应用:
```js
app.controller('myCtrl', function($scope) {
    $scope.firstName= "John";
    $scope.lastName= "Doe";
});
```

## 指令

除了上面讲的外，常见的还有：
1. ng-show 控制元素的disable值达到显示与隐藏
2. ng-repeat 指令会重复一个 HTML 元素：
```html
<li ng-repeat="x in names">
  {{ x }}
</li>
```

### 自定义指令 directive

```html
<body ng-app="myApp">
<runoob-directive></runoob-directive>
<script>
var app = angular.module("myApp", []);
app.directive("runoobDirective", function() {
    return {
        template : "<h1>自定义指令!</h1>"
    };
});
</script>

</body>
```

> 使用驼峰法来命名一个指令， runoobDirective, 但在使用它时需要以 - 分割, runoob-directive:

还可以用以下方式去调用该指令
1. 属性
```html
<div runoob-directive></div>
```
2. 类名
```html
<div class="runoob-directive"></div>

<script>
var app = angular.module("myApp", []);
app.directive("runoobDirective", function() {
    return {
        restrict : "C",
        template : "<h1>自定义指令!</h1>"
    };
});
</script>

<p><strong>注意：</strong> 你必须设置 <b>restrict</b> 的值为 "C" 才能通过类名来调用指令。</p>
```
3. 注释
```html
<body ng-app="myApp">

<!-- directive: runoob-directive -->

<script>
var app = angular.module("myApp", []);
app.directive("runoobDirective", function() {
    return {
        restrict : "M",
        replace : true,
        template : "<h1>自定义指令!</h1>"
    };
});
</script>

<p><strong>注意：</strong> 我们需要在该实例添加 <strong>replace</strong> 属性， 否则评论是不可见的。</p>

<p><strong>注意：</strong> 你必须设置 <b>restrict</b> 的值为 "M" 才能通过注释来调用指令。</p>
```

restrict 值可以是以下几种:

1. E 作为元素名使用
2. A 作为属性使用
3. C 作为类名使用
4. M 作为注释使用

> restrict 默认值为 EA, 即可以通过元素名和属性名来调用指令。

## 模型 ng-model

除了上述说的，还有以下需要了解：

### 应用状态

ng-model 指令可以为应用数据提供状态值(invalid, dirty, touched, error):

```html
<form ng-app="" name="myForm" ng-init="myText = 'test@runoob.com'">
    Email:
    <input type="email" name="myAddress" ng-model="myText" required>
<p>编辑邮箱地址，查看状态的改变。</p>
<h1>状态</h1>
<p>Valid: {{myForm.myAddress.$valid}} (如果输入的值是合法的则为 true)。</p>
<p>Dirty: {{myForm.myAddress.$dirty}} (如果值改变则为 true)。</p>
<p>Touched: {{myForm.myAddress.$touched}} (如果通过触屏点击则为 true)。</p>
</form>
```

### CSS类

基于状态为html元素提供了css类

举例：
```html
<style>
input.ng-dirty {
    background-color: lightblue;
}
</style>
</head>
<body>

<form ng-app="" name="myForm">
    输入你的名字:
    <input name="myName" ng-model="myText" required>
</form>
```
当input的值改变时，应用了`input.ng-dirty` 的样式

有以下css类：

1. ng-valid: 验证通过
2. ng-invalid: 验证失败
3. ng-valid-[key]: 由$setValidity添加的所有验证通过的值
4. ng-invalid-[key]: 由$setValidity添加的所有验证失败的值
5. ng-pristine: 控件为初始状态
6. ng-dirty: 控件输入值已变更
7. ng-touched: 控件已失去焦点
8. ng-untouched: 控件未失去焦点
9. ng-pending: 任何为满足$asyncValidators的情况

## 作用域 scope

AngularJS 应用组成如下：

- View(视图), 即 HTML。
- Model(模型), 当前视图中可用的数据。
- Controller(控制器), 即 JavaScript 函数，可以添加或修改属性。

```html
<div ng-app="myApp" ng-controller="myCtrl">
    <input ng-model="name">
    <h1>{{greeting}}</h1>
    <button ng-click='sayHello()'>点我</button>    
</div>
 
<script>
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
    $scope.name = "Runoob";
    $scope.sayHello = function() {
        $scope.greeting = 'Hello ' + $scope.name + '!';
    };
});
</script>
```

这里scope的作用域在 整个div中都可以用，如果改成以下，
```html
<div ng-app="myApp" >
    <input ng-model="name" ng-controller="myCtrl">
    <h1>{{name}}</h1>
</div>
 
<script>
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
    $scope.name = "Runoob";
});
</script>
```
`<h1>{{name}}</h1>` 不在 myCtrl 的作用域下，所以拿不到值

### 根作用域 rootScope

rootscope 定义的值，可以在各个 controller 中使用。

参数的位置随意 但是参数命名一定要是`$rootscope`

上面的例子修改如下：
```html
<div ng-app="myApp" >
    <input ng-model="name" ng-controller="myCtrl">
    <h1>{{name}}</h1>
</div>
 
<script>
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope,$rootScope) {
    $scope.name = "Runoob";
    $rootScope.name = "root Runoob";
});
</script>
```

`<h1>{{name}}</h1>` 在根作用域有name的值，故这边可以显示`root Runoob` ,而input按照作用域传递原则，先拿到自己控制器作用域的`Runoob`

> 把 `$scope.name = "Runoob";` 注释掉，input中能取到rootScope中的name对应的`root Runoob`,但input中name值的更新依然不会影响到h1中的name

## 控制器 controller

略，看上文

## 过滤器 

用于转换数据。

自带的过滤器有：

- currency 格式化数字为货币格式。
- filter 从数组项中选择一个子集。
- lowercase 格式化字符串为小写。
- orderBy 根据某个表达式排列数组。
- uppercase 格式化字符串为大写。

在表达式中使用：

```
{{ 变量 | 过滤器}}
```

在输入中使用

过滤器后跟一个冒号和一个模型名称(或者一个常量)

```html
<div ng-app="myApp" ng-controller="namesCtrl">

<p>输入过滤:</p>

<p><input type="text" ng-model="test"></p>

<ul>
  <li ng-repeat="x in names | filter:test ">
    {{ (x.name | uppercase) + ', ' + x.country }}
  </li>
</ul>

</div>

<script>
angular.module('myApp', []).controller('namesCtrl', function($scope) {
    $scope.names = [
        {name:'Jani',country:'Norway'},
        {name:'Hege',country:'Sweden'},
        {name:'Kai',country:'Denmark'}
    ];
});
</script>
```

以上例子即，对于names的每一项，过滤出满足 `indexOf(test)>=0`的项

再加个orderBy的过滤器：` <li ng-repeat="x in names | filter:test | orderBy:'country'">`

在 `indexOf(test)>=0`的前提下，按每项的`country`进行升序排序，若要降序，使用`orderBy:'country':true`

### 自定义过滤器
自定义一个过滤器 reverse，将字符串反转：
```html
<div ng-app="myApp" ng-controller="myCtrl">


姓名: {{ msg | reverse }}

</div>

<script>
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
    $scope.msg = "Runoob";
});
app.filter('reverse', function() { //可以注入依赖
    return function(text) {
        return text.split("").reverse().join("");
    }
});
</script>
```

## 服务 Service

服务是一个函数或对象，在 Angular 应用中使用。

service 是单例对象，在应用生命周期结束才会被清除

### 内置服务

作为参数传递到 controller 中即可使用，例：
```js
app.controller('customersCtrl', function($scope, $location) {
    $scope.myUrl = $location.absUrl();
});
```

 Angular 常用的内置服务

- $location
> 返回当前页面的url地址
- $http 服务
> 向服务端发送请求，`$http.get`等，参见 http://www.runoob.com/angularjs/angularjs-http.html
- $injector
> 可以用于获取其他对象（服务作用域控制器等）：`$injector.get("userService")`
### 自定义的服务

```js
//创建名为hexafy 的服务:
app.service('hexafy', function() {
    this.myFunc = function (x) {
        return x.toString(16);
    }
});

//使用自定义的的服务 hexafy 将一个数字转换为16进制数:

app.controller('myCtrl', function($scope, hexafy) {
    $scope.hex = hexafy.myFunc(255);
});
```

在过滤器中使用服务,数组前面要传入服务名

```js
app.filter('myFormat',['hexafy', function(hexafy) {
    return function(x) {
        return hexafy.myFunc(x);
    };
}]);
```

综合使用 service、controller、filter

```html
<div ng-app="myApp" ng-controller="myCtrl">
<p>在获取数组 [255, 251, 200] 值时使用过滤器:</p>

<ul>
  <li ng-repeat="x in counts">{{x | myFormat}}</li>
</ul>

<p>过滤器使用服务将10进制转换为16进制。</p>
</div>

<script>
var app = angular.module('myApp', []);
app.service('hexafy', function() {
	this.myFunc = function (x) {
        return x.toString(16);
    }
});
app.filter('myFormat',['hexafy', function(hexafy) {
    return function(x) {
        return hexafy.myFunc(x);
    };
}]);
app.controller('myCtrl', function($scope) {
    $scope.counts = [255, 251, 200];
});
</script>
```

## 依赖注入

有5个核心组件用于依赖注入

### value

value:一个简单js对象，用于向控制器或其他组件传值

```js
var mainApp = angular.module("mainApp", []);
mainApp.value("defaultInput", 5);
mainApp.controller('CalcController', function($scope, defaultInput) {
    console.log(defaultInput) //5
})
```

### factory

factory: 一个函数，用于计算和返回值。一般用在service和controller
```js
mainApp.factory('MathService', function() {
   var factory = {};
   
   factory.multiply = function(a, b) {
      return a * b
   }
   return factory;
}); 
```

## service

见上一节，service与factory的区别在于：

service 是用new实例化的，所以属性和方法定义在this上，

factory 是创建并返回一个对象

。。 好像就只是写法上的差异，没有核心差异

### provider

通过 provider 创建一个 service、factory

```js
// 使用 provider 创建 service 定义一个方法用于计算两数乘积
mainApp.config(function($provide) {
   $provide.provider('MathService', function() {
       // 用于返回 value/service/factory
      this.$get = function() {
         var factory = {};  
         
         factory.multiply = function(a, b) {
            return a * b; 
         }
         return factory;
      };
   });
});
```

具体使用差异 不过多了解

### constant

配置常量

```js
mainApp.constant("configParam", "constant value");
```

## 路由

1. 需要引入angular-route

2. 在主模块中添加依赖模块——ngRoute
```js
angular.module('routingDemoApp',['ngRoute'])
```
3. 使用 ngView 指令

```html
<div ng-view></div>
```
div 中内容会根据路由变化而变化

4. 配置$routeProvider

```js
module.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/',{template:'这是首页页面'})
        .when('/computers',{template:'这是电脑分类页面'})
        .when('/printers',{template:'这是打印机页面'})
        .otherwise({redirectTo:'/'});
}]);
```

when 表示命中，otherwise表其他，

里面第一个参数是url或者正则，第二个参数是路由配置对象。

路由配置对象：
```js
$routeProvider.when(url,{
    template:string, //在ng-view中插入简单的html内容
    templateUrl:string, //在ng-view中插入html模版文件
    controller:string,function / array, //在当前模版上执行的controller函数
    controllerAs:string, //为controller指定别名
    redirectTo:string,function, //重定向的地址
    resolve:object<key,function> //指定当前controller所依赖的其他模块
});
```

不想新建html文件时，可以用
```html
<script type="text/ng-template" id="embedded.about.html">
      <h1> About </h1>
  </script>
```
templateUrl中指定`embedded.about.html`即可

### ui-view + angular-ui-router + $stateProvider

## run
```js
module.run(function(...){
    //里面的代码将直接运行，一般用于执行配置
})
``` 

## 第三方插件

略

## vs Vue2

以下的相当，只是说明做技术栈迁移时的考虑方向。肯定有些细节不一样

directive 相当于 vue 的 props

controller 相当于 vue 的 method 

数据相当于 vue 的 data 和 prop

html 相当于 vue 的 template

directive 中的 link: function(scope, element)

scope 相当于 vue 的当前作用域 this

ng1.x 中 element 表示带有类似 jquery 方法的 dom 节点；在 vue 中通过 ref 拿到的是实际 dom 节点


