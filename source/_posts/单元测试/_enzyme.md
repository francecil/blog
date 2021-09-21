## enzyme

有几种用法渲染组件

render: 仅渲染当前组件，不提供其他操作，不处理子组件，一般用在 toMatchSnapshot 上

mount: 渲染当前组件及子组件，并提供操作

shallow: 渲染当前组件并提供操作，不处理子组件

