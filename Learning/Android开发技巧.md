## 单步调试
`F6` `Step Over` 程序向下执行一行（如果当前行有方法调用，不进入方法体，直接到下一行）

`F5` `Step Into` 程序向下执行一行（如果该行有自定义方法，则运行进入自定义方法（不会进入官方类库的方法）会进入Log方法，算是bug吗？

`Alt+Shift+F7`  `Force Step Into` 任何方法都会进入

`F7` `Step Out `  跳出当前方法，返回到该方法被调用处的下一行语句。tips:循环代码段，执行Step Out将跳过一次循环.

`Ctrl + R ` `Run to Cursor` 直接到光标处

`Drop Frame` 返回当前方法的调用处重新执行，上下文变量也恢复如初。未测试过..

## 高级调试

### 跨断点

点击右三角按钮(Resume Program) `F8` ,进入下一断点。（两断点间代码已执行完毕

注：断点打在循环上的话，下一断点还是循环体

### 设置变量值

变量右键 set value

### 查看断点`View BreakPoints` `Ctrl+Shift_F8`

两个重叠圈的按钮，弹出一个界面.

可以设置条件断点 满足条件时暂停程序运行.

该做法更灵活，定位快。


## Log
logt : TAG
logm : 带方法、参数的Log.d
logd : 带方法的Log.d

##AS 项目结构

`*.iml`文件 as项目结构的配置文件

project :demo 与此同时它也是一个跟module 所以在根路径下点make module 会有demo和子module

module : 默认app 可添加多个，一般一个主工程 其他的为sdk

## SVN 使用

取消与SVN的关联/找不到Share Project(Subversion)

在Project模式下有个.idea文件夹,找到vcs.xml文件,把里面的vcs="svn"改为vcs=""即可。

## SVN 设置过滤

方法一、在项目的.idea/workspace.xml的文件里设置

<?xml version="1.0" encoding="UTF-8"?>    
	<project>    
    	<component name="ChangeListManager">    
     	   ...    
    	<ignored path=".gradle/" />     
    	<ignored path=".idea/" />     
    	<ignored path="gradle/" />   
    	<ignored path="项目名/build/" />    
    	<ignored path="gradlew" />    
    	<ignored path="gradlew.bat" />    
    	<ignored mask="*.iml" />     
    	<ignored path="local.properties" />    
    	<ignored path="build/" />   
    	<ignored mask="*.apk" />  
    	</component>    
    	...    
	</project>  
	

白色主题的：黄色表示被过滤 绿色为未过滤

## Mark Resolved

出现冲突后，我方不能提交，此时只要将冲突文件标记解决冲突后，即可提交

