## svg坐标系统



## `<marker>`

作为标记使用，子元素可以整合path等使用

markerWidth和markerHeight控制整体的显示大小

refX和refY可以将整体进行某个方向的偏移

viewBox 定义了一套坐标系（x, y, width, height）

举例：
```html
<defs>
          <marker
            id="arrow"
            markerUnits="strokeWidth"
            markerWidth="8"
            markerHeight="8"
            viewBox="0 0 100 100"
            refX="10"
            refY="20"
            orient="auto">
            <!-- <path
              d="M2,2 L10,6 L2,10 L6,6 L2,2"
              style="fill: gray" /> -->
            <polygon
              points="0,0 10,20 0,40 60,20"
              stroke="gray"
              fill="gray"
              stroke-width="1px"/>
          </marker>
        </defs>
```
在`viewBox="0 0 100 100"`这个坐标系中，定义了一个polygon多边形箭头，按`points="0,0 10,20 0,40 60,20"`连线。

其中(10,20)为箭头的凹点,在未定义marker的refX/Y时，其他svg通过`marker-end="url(#arrow)"`导入在箭头时，连接点为（0,0）,两者错位了

所以我们需要将marker的坐标系统相对移动，这里选择了凹点（10,20）这个点，故`refX="10" refY="20"`